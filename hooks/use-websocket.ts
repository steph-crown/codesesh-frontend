"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientMessage } from "@/lib/ws-messages";
import { parseServerMessage, type ServerMessage } from "@/lib/ws-messages";

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
      clearReconnectTimer();
      userDisconnectRef.current = true;
      wsRef.current?.close();
      wsRef.current = null;
      queueMicrotask(() => {
        setConnectionState("idle");
      });
      return;
    }

    userDisconnectRef.current = false;
    reconnectAttemptRef.current = 0;
    clearReconnectTimer();

    function scheduleReconnect() {
      if (userDisconnectRef.current) {
        setConnectionState("disconnected");
        return;
      }
      if (reconnectAttemptRef.current >= MAX_ATTEMPTS) {
        setConnectionState("disconnected");
        return;
      }
      const delay =
        BACKOFF_MS[
          Math.min(reconnectAttemptRef.current, BACKOFF_MS.length - 1)
        ] ?? 30_000;
      reconnectAttemptRef.current += 1;
      setConnectionState("reconnecting");
      reconnectTimerRef.current = setTimeout(() => {
        openSocket();
      }, delay);
    }

    function openSocket() {
      clearReconnectTimer();
      userDisconnectRef.current = false;
      setConnectionState((s) => (s === "idle" ? "connecting" : "reconnecting"));
      try {
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          reconnectAttemptRef.current = 0;
          setConnectionState("connected");
          onOpenRef.current?.();
        };

        ws.onmessage = (ev) => {
          if (typeof ev.data !== "string") return;
          try {
            const parsed = parseServerMessage(ev.data);
            if (parsed) onMessageRef.current(parsed);
          } catch {
            /* ignore */
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          onCloseRef.current?.();
          if (userDisconnectRef.current) {
            setConnectionState("disconnected");
            return;
          }
          scheduleReconnect();
        };
      } catch {
        setConnectionState("disconnected");
      }
    }

    openSocket();

    return () => {
      userDisconnectRef.current = true;
      clearReconnectTimer();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [clearReconnectTimer, enabled, url]);

  return { sendMessage, connectionState, disconnect };
}
