"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import type { SessionDetail, ChatMessage, Participant } from "@/lib/api-types";
import { applyTextDelta } from "@/lib/apply-text-delta";
import { getSessionWsUrl } from "@/lib/ws-url";
import type {
  ChatMessagePayload,
  ClientMessage,
  EditorRange,
  ParticipantInfo,
  ServerMessage,
  SessionLanguageWire,
  TextChangeDelta,
} from "@/lib/ws-messages";
import { useWebSocket, type ConnectionState } from "@/hooks/use-websocket";
import { playPingSound } from "@/lib/play-ping-sound";

type SessionState = {
  session: SessionDetail;
  content: string;
  version: number;
  language: SessionLanguageWire;
  participants: Participant[];
  messages: ChatMessage[];
  sessionEnded: boolean;
};

type Action =
  | { type: "full_sync"; content: string; version: number; language: SessionLanguageWire; participants: ParticipantInfo[]; messages: ChatMessagePayload[] }
  | { type: "local_set"; content: string }
  | { type: "local_bump" }
  | { type: "text_change_remote"; delta: TextChangeDelta; version: number }
  | { type: "chat"; msg: ChatMessage }
  | { type: "language"; language: SessionLanguageWire }
  | { type: "participant_join"; p: ParticipantInfo }
  | { type: "participant_leave"; user_id: string }
  | { type: "session_ended" };

function payloadToChat(
  sessionId: string,
  p: ChatMessagePayload,
): ChatMessage {
  return {
    id: p.id,
    session_id: sessionId,
    user_id: p.user_id,
    display_name: p.display_name,
    color: p.color,
    content: p.content,
    created_at: p.created_at,
  };
}

function infoToParticipant(p: ParticipantInfo): Participant {
  return {
    user_id: p.user_id,
    display_name: p.display_name,
    color: p.color,
    joined_at: p.joined_at ?? new Date().toISOString(),
    is_active: true,
  };
}

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "full_sync":
      return {
        ...state,
        content: action.content,
        version: action.version,
        language: action.language,
        participants: action.participants.map(infoToParticipant),
        messages: action.messages.map((m) =>
          payloadToChat(state.session.id, m),
        ),
      };
    case "local_set":
      return { ...state, content: action.content };
    case "local_bump":
      return { ...state, version: state.version + 1 };
    case "text_change_remote": {
      const next = applyTextDelta(state.content, action.delta);
      return {
        ...state,
        content: next,
        version: action.version,
      };
    }
    case "chat":
      return {
        ...state,
        messages: [...state.messages, action.msg],
      };
    case "language":
      return { ...state, language: action.language };
    case "participant_join": {
      const exists = state.participants.some(
        (x) => x.user_id === action.p.user_id,
      );
      if (exists) return state;
      return {
        ...state,
        participants: [...state.participants, infoToParticipant(action.p)],
      };
    }
    case "participant_leave":
      return {
        ...state,
        participants: state.participants.filter(
          (x) => x.user_id !== action.user_id,
        ),
      };
    case "session_ended":
      return { ...state, sessionEnded: true };
    default:
      return state;
  }
}

export type SessionContextValue = {
  session: SessionDetail;
  sessionId: string;
  content: string;
  version: number;
  language: SessionLanguageWire;
  participants: Participant[];
  messages: ChatMessage[];
  connectionState: ConnectionState;
  sessionEnded: boolean;
  sendTextChange: (range: EditorRange, text: string, version: number) => void;
  sendCursorMove: (line: number, column: number) => void;
  sendChatMessage: (content: string) => void;
  sendLanguageChange: (language: SessionLanguageWire) => void;
  /** `null` = ping everyone (except you). */
  sendPing: (targetUserId: string | null) => void;
  leaveSession: () => void;
  setLocalContent: (content: string) => void;
  bumpLocalVersion: () => void;
  isApplyingRemoteEdit: React.MutableRefObject<boolean>;
  hasReceivedFullSync: React.MutableRefObject<boolean>;
  remoteEpoch: number;
};

const Ctx = createContext<SessionContextValue | null>(null);

export function SessionProvider({
  session,
  sessionId,
  userId,
  enabled,
  children,
}: {
  session: SessionDetail;
  sessionId: string;
  userId: string;
  enabled: boolean;
  children: React.ReactNode;
}) {
  const isApplyingRemoteEdit = useRef(false);
  const hasReceivedFullSync = useRef(false);
  const [remoteEpoch, setRemoteEpoch] = useState(0);
  const sendMessageForResyncRef = useRef<((msg: ClientMessage) => void) | null>(
    null,
  );
  const lastVersionResyncAtRef = useRef(0);

  const initial: SessionState = {
    session,
    content: session.content ?? "",
    version: 0,
    language: (session.language as SessionLanguageWire) ?? "typescript",
    participants: [],
    messages: [],
    sessionEnded: session.status === "ended",
  };

  const [state, dispatch] = useReducer(reducer, initial);

  const onMessage = useCallback(
    (msg: ServerMessage) => {
      switch (msg.type) {
        case "full_sync": {
          setRemoteEpoch((n) => n + 1);
          dispatch({
            type: "full_sync",
            content: msg.content,
            version: msg.version,
            language: msg.language,
            participants: msg.participants,
            messages: msg.messages,
          });
          break;
        }
        case "text_change": {
          dispatch({
            type: "text_change_remote",
            delta: msg.delta,
            version: msg.version,
          });
          break;
        }
        case "chat_message": {
          dispatch({
            type: "chat",
            msg: payloadToChat(session.id, {
              id: msg.id,
              content: msg.content,
              user_id: msg.user_id,
              display_name: msg.display_name,
              color: msg.color,
              created_at: msg.created_at,
            }),
          });
          break;
        }
        case "language_change":
          dispatch({ type: "language", language: msg.language });
          break;
        case "participant_join":
          dispatch({
            type: "participant_join",
            p: {
              user_id: msg.user_id,
              display_name: msg.display_name,
              color: msg.color,
              joined_at: msg.joined_at,
            },
          });
          break;
        case "participant_leave":
          dispatch({ type: "participant_leave", user_id: msg.user_id });
          break;
        case "ping_received": {
          const who = msg.from_display_name;
          playPingSound();
          if (msg.scope === "everyone") {
            toast.info(`${who} pinged everyone`, {
              description: "Someone wants attention in this session.",
            });
          } else {
            toast.info(`${who} pinged you`, {
              description: "They want your attention.",
            });
          }
          break;
        }
        case "session_ended":
          dispatch({ type: "session_ended" });
          toast.info("This session has ended");
          break;
        case "error":
          if (process.env.NODE_ENV === "development") {
            console.warn("[ws error]", msg.code, msg.message);
          }
          if (msg.code === "EVENT_CAP_REACHED") {
            dispatch({ type: "session_ended" });
            toast.info("This session has ended");
            break;
          }
          if (msg.code === "VERSION_MISMATCH") {
            const now = Date.now();
            if (now - lastVersionResyncAtRef.current > 2000) {
              lastVersionResyncAtRef.current = now;
              sendMessageForResyncRef.current?.({ type: "request_full_sync" });
            }
          }
          break;
        default:
          break;
      }
    },
    [session.id],
  );

  const url = useMemo(
    () => getSessionWsUrl(session.short_id, userId),
    [session.short_id, userId],
  );

  const { sendMessage, connectionState, disconnect } = useWebSocket({
    url,
    onMessage,
    enabled: enabled && !!userId,
  });

  useEffect(() => {
    sendMessageForResyncRef.current = sendMessage;
  }, [sendMessage]);

  const sendTextChange = useCallback(
    (range: EditorRange, text: string, version: number) => {
      sendMessage({
        type: "text_change",
        range,
        text,
        version,
      });
    },
    [sendMessage],
  );

  const bumpLocalVersion = useCallback(() => {
    dispatch({ type: "local_bump" });
  }, []);

  const sendCursorMove = useCallback(
    (line: number, column: number) => {
      sendMessage({ type: "cursor_move", line, column });
    },
    [sendMessage],
  );

  const sendChatMessage = useCallback(
    (content: string) => {
      sendMessage({ type: "chat_message", content });
    },
    [sendMessage],
  );

  const sendLanguageChange = useCallback(
    (language: SessionLanguageWire) => {
      sendMessage({ type: "language_change", language });
    },
    [sendMessage],
  );

  const sendPing = useCallback(
    (targetUserId: string | null) => {
      sendMessage({ type: "ping", target_user_id: targetUserId });
    },
    [sendMessage],
  );

  const leaveSession = useCallback(() => {
    sendMessage({ type: "leave" });
    disconnect();
  }, [disconnect, sendMessage]);

  const setLocalContent = useCallback((content: string) => {
    dispatch({ type: "local_set", content });
  }, []);

  const value: SessionContextValue = {
    session,
    sessionId,
    content: state.content,
    version: state.version,
    language: state.language,
    participants: state.participants,
    messages: state.messages,
    connectionState,
    sessionEnded: state.sessionEnded || session.status === "ended",
    sendTextChange,
    sendCursorMove,
    sendChatMessage,
    sendLanguageChange,
    sendPing,
    leaveSession,
    setLocalContent,
    bumpLocalVersion,
    isApplyingRemoteEdit,
    hasReceivedFullSync,
    remoteEpoch,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSessionContext(): SessionContextValue {
  const v = useContext(Ctx);
  if (!v) {
    throw new Error("useSessionContext requires SessionProvider");
  }
  return v;
}
