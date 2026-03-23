"use client";

/**
 * WebSocket hook with reconnect backoff.
 *
 * **Debug:** In development, logs `[codesesh-ws]` to the console. Override with
 * `NEXT_PUBLIC_WS_DEBUG=1` (force on) or `NEXT_PUBLIC_WS_DEBUG=0` (force off).
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  parseServerMessage,
  type ClientMessage,
  type ServerMessage,
} from "@/lib/ws-messages";

export type ConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected";

export interface UseWebSocketOptions {
  url: string;
  onMessage: (msg: ServerMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  enabled: boolean;
}

export interface UseWebSocketReturn {
  sendMessage: (msg: ClientMessage) => void;
  connectionState: ConnectionState;
  disconnect: () => void;
}

const BACKOFF_MS = [1000, 2000, 4000, 8000, 16_000, 30_000];
const MAX_ATTEMPTS = 5;

/** Monotonic id for correlating WebSocket lifecycle in console (see NEXT_PUBLIC_WS_DEBUG). */
let wsDebugSerial = 0;

function wsDebugEnabled(): boolean {
  if (typeof process === "undefined") return false;
  const v = process.env.NEXT_PUBLIC_WS_DEBUG;
  if (v === "0" || v === "false") return false;
  if (v === "1" || v === "true") return true;
  return process.env.NODE_ENV === "development";
}

function wsLog(payload: Record<string, unknown>): void {
  if (!wsDebugEnabled()) return;
  // eslint-disable-next-line no-console -- intentional debug channel
  console.info("[codesesh-ws]", payload);
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { url, onMessage, onOpen, onClose, enabled } = options;
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const userDisconnectRef = useRef(false);
  const onMessageRef = useRef(onMessage);
  const onOpenRef = useRef(onOpen);
  const onCloseRef = useRef(onClose);

  const [connectionState, setConnectionState] =
    useState<ConnectionState>("idle");

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current !== undefined) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = undefined;
    }
  }, []);

  const sendMessage = useCallback((msg: ClientMessage) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(JSON.stringify(msg));
    } catch {
      /* ignore */
    }
  }, []);

  const disconnect = useCallback(() => {
    userDisconnectRef.current = true;
    clearReconnectTimer();
    wsRef.current?.close();
    wsRef.current = null;
    setConnectionState("disconnected");
  }, [clearReconnectTimer]);

  useEffect(() => {
    if (!enabled || typeof globalThis.window === "undefined") {
      wsLog({
        event: "effect_skip",
        reason: !enabled ? "disabled" : "no_window",
        url,
      });
      clearReconnectTimer();
      userDisconnectRef.current = true;
      wsRef.current?.close();
      wsRef.current = null;
      queueMicrotask(() => {
        setConnectionState("idle");
      });
      return;
    }

    wsLog({
      event: "effect_mount",
      url,
      enabled,
    });

    userDisconnectRef.current = false;
    reconnectAttemptRef.current = 0;
    clearReconnectTimer();

    function scheduleReconnect() {
      if (userDisconnectRef.current) {
        wsLog({
          event: "schedule_reconnect_skip",
          reason: "user_disconnect",
        });
        setConnectionState("disconnected");
        return;
      }
      if (reconnectAttemptRef.current >= MAX_ATTEMPTS) {
        wsLog({
          event: "schedule_reconnect_skip",
          reason: "max_attempts",
          maxAttempts: MAX_ATTEMPTS,
        });
        setConnectionState("disconnected");
        return;
      }
      const delay =
        BACKOFF_MS[
          Math.min(reconnectAttemptRef.current, BACKOFF_MS.length - 1)
        ] ?? 30_000;
      reconnectAttemptRef.current += 1;
      const attempt = reconnectAttemptRef.current;
      setConnectionState("reconnecting");
      wsLog({
        event: "reconnect_scheduled",
        delayMs: delay,
        attempt,
        url,
      });
      reconnectTimerRef.current = setTimeout(() => {
        openSocket();
      }, delay);
    }

    function openSocket() {
      clearReconnectTimer();
      userDisconnectRef.current = false;
      const phase =
        reconnectAttemptRef.current === 0 ? "connecting" : "reconnecting";
      setConnectionState(phase);
      const wsId = ++wsDebugSerial;
      try {
        wsLog({
          event: "open_socket",
          wsId,
          phase,
          reconnectAttempt: reconnectAttemptRef.current,
          url,
        });
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          // Ignore if this socket was replaced (e.g. navigated to another session).
          if (wsRef.current !== ws) {
            wsLog({
              event: "onopen_ignored_stale",
              wsId,
              refMatches: false,
            });
            return;
          }
          wsLog({ event: "onopen", wsId, url });
          reconnectAttemptRef.current = 0;
          setConnectionState("connected");
          onOpenRef.current?.();
        };

        ws.onmessage = (ev) => {
          if (wsRef.current !== ws) return;
          if (typeof ev.data !== "string") return;
          try {
            const parsed = parseServerMessage(ev.data);
            if (parsed) onMessageRef.current(parsed);
          } catch {
            /* ignore */
          }
        };

        ws.onclose = (ev) => {
          // Critical: when `url` changes, the new socket is already in `wsRef`. The old
          // socket closes asynchronously; without this guard we null the new ref and
          // schedule reconnect backoff (long "reconnecting" / broken state until refresh).
          const stale = wsRef.current !== ws;
          if (stale) {
            wsLog({
              event: "onclose_ignored_stale",
              wsId,
              code: ev.code,
              reason: ev.reason,
              wasClean: ev.wasClean,
              refIs: wsRef.current === null ? "null" : "other_socket",
            });
            return;
          }
          wsLog({
            event: "onclose",
            wsId,
            code: ev.code,
            reason: ev.reason,
            wasClean: ev.wasClean,
            userDisconnect: userDisconnectRef.current,
          });
          wsRef.current = null;
          onCloseRef.current?.();
          if (userDisconnectRef.current) {
            setConnectionState("disconnected");
            return;
          }
          scheduleReconnect();
        };
      } catch (e) {
        wsLog({
          event: "open_socket_throw",
          wsId,
          error: String(e),
        });
        setConnectionState("disconnected");
      }
    }

    openSocket();

    return () => {
      wsLog({
        event: "effect_cleanup",
        url,
      });
      userDisconnectRef.current = true;
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [clearReconnectTimer, enabled, url]);

  return { sendMessage, connectionState, disconnect };
}
