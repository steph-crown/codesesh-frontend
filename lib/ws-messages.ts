/** Mirrors Rust `ws::messages` JSON (snake_case fields from serde). */

export type SessionLanguageWire =
  | "typescript"
  | "javascript"
  | "python"
  | "go"
  | "rust"
  | "cpp"
  | "c"
  | "csharp"
  | "java"
  | "kotlin"
  | "swift"
  | "ruby"
  | "php"
  | "dart"
  | "scala"
  | "elixir"
  | "racket";

export interface EditorRange {
  start_line: number;
  start_column: number;
  end_line: number;
  end_column: number;
}

export interface TextChangeDelta {
  range: EditorRange;
  text: string;
  version: number;
}

export interface ClientMessageTextChange {
  type: "text_change";
  range: EditorRange;
  text: string;
  version: number;
}

export interface ClientMessageCursorMove {
  type: "cursor_move";
  line: number;
  column: number;
}

export interface ClientMessageChat {
  type: "chat_message";
  content: string;
}

export interface ClientMessageLanguage {
  type: "language_change";
  language: SessionLanguageWire;
}

export interface ClientMessageLeave {
  type: "leave";
}

/** Ask server for authoritative document (recovery after `VERSION_MISMATCH`). */
export interface ClientMessageRequestFullSync {
  type: "request_full_sync";
}

/** `target_user_id: null` = ping everyone except yourself. */
export interface ClientMessagePing {
  type: "ping";
  target_user_id: string | null;
}

export type ClientMessage =
  | ClientMessageTextChange
  | ClientMessageRequestFullSync
  | ClientMessageCursorMove
  | ClientMessageChat
  | ClientMessageLanguage
  | ClientMessagePing
  | ClientMessageLeave;

export interface ParticipantInfo {
  user_id: string;
  display_name: string;
  color: string;
  /** ISO timestamp from server (first join time for this session). */
  joined_at: string;
}

export interface ChatMessagePayload {
  id: string;
  content: string;
  user_id: string;
  display_name: string;
  color: string;
  created_at: string;
}

export interface FullSyncPayload {
  content: string;
  version: number;
  language: SessionLanguageWire;
  participants: ParticipantInfo[];
  messages: ChatMessagePayload[];
  is_owner: boolean;
}

export interface TextChangePayload {
  delta: TextChangeDelta;
  version: number;
  user_id: string;
  display_name: string;
}

export interface CursorPayload {
  line: number;
  column: number;
  user_id: string;
  display_name: string;
  color: string;
}

export interface LanguageChangePayload {
  language: SessionLanguageWire;
  user_id: string;
  display_name: string;
}

export interface ParticipantPayload {
  user_id: string;
  display_name: string;
  color: string;
  joined_at: string;
}

export interface ParticipantLeavePayload {
  user_id: string;
  display_name: string;
}

export type SessionEndReason =
  | "host_ended"
  | "idle_timeout"
  | "event_cap_reached";

export interface SessionEndedPayload {
  reason: SessionEndReason;
}

export interface WsErrorPayload {
  code: string;
  message: string;
}

export type ServerMessage =
  | {
      type: "full_sync";
      content: string;
      version: number;
      language: SessionLanguageWire;
      participants: ParticipantInfo[];
      messages: ChatMessagePayload[];
      is_owner: boolean;
    }
  | {
      type: "text_change";
      delta: TextChangeDelta;
      version: number;
      user_id: string;
      display_name: string;
    }
  | {
      type: "cursor_move";
      line: number;
      column: number;
      user_id: string;
      display_name: string;
      color: string;
    }
  | {
      type: "chat_message";
      id: string;
      content: string;
      user_id: string;
      display_name: string;
      color: string;
      created_at: string;
    }
  | {
      type: "language_change";
      language: SessionLanguageWire;
      user_id: string;
      display_name: string;
    }
  | {
      type: "participant_join";
      user_id: string;
      display_name: string;
      color: string;
      joined_at: string;
    }
  | { type: "participant_leave"; user_id: string; display_name: string }
  | {
      type: "ping_received";
      from_user_id: string;
      from_display_name: string;
      from_color: string;
      scope: "everyone" | "direct";
    }
  | { type: "session_ended"; reason: SessionEndReason }
  | { type: "error"; code: string; message: string };

export function parseServerMessage(raw: string): ServerMessage | null {
  try {
    const v = JSON.parse(raw) as Record<string, unknown>;
    const t = v.type as string;
    if (typeof t !== "string") return null;
    return v as ServerMessage;
  } catch {
    return null;
  }
}
