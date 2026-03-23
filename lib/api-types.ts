export type SessionVisibility = "private" | "view_only" | "edit";
export type SessionStatus = "active" | "ended";

export interface SessionSummary {
  id: string;
  short_id: string;
  name: string;
  language: string;
  visibility: SessionVisibility;
  status: SessionStatus;
  event_count: number;
  is_owner: boolean;
  last_activity_at: unknown;
  created_at: unknown;
}

export interface SessionDetail extends SessionSummary {
  /** Session creator (host); compare to `Participant.user_id` for role. */
  host_id: string;
  content: string;
  updated_at: unknown;
}

export interface Participant {
  user_id: string;
  display_name: string;
  color: string;
  joined_at: unknown;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  color: string;
  content: string;
  created_at: unknown;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface MessageHistory {
  messages: ChatMessage[];
  has_more: boolean;
}

export interface UserResponse {
  id: string;
  display_name: string;
  color: string;
  created_at: string;
}

export type CreateUserResponse = UserResponse;

export interface GetSessionsQuery {
  search?: string;
  created_by_me?: boolean;
  shared_with_me?: boolean;
  page?: number;
  limit?: number;
}

export interface GetMessagesQuery {
  limit?: number;
  before?: string;
}

/** Private session notes (REST). `id` / `updated_at` null until first successful save. */
export interface SessionNoteResponse {
  id: string | null;
  session_id: string;
  user_id: string;
  content: string;
  updated_at: string | null;
}

export interface UpsertSessionNoteBody {
  content: string;
}
