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
  last_activity_at: string;
  created_at: string;
}

export interface SessionDetail extends SessionSummary {
  content: string;
  updated_at: string;
}

export interface Participant {
  user_id: string;
  display_name: string;
  color: string;
  joined_at: string;
  is_active: boolean;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  user_id: string;
  display_name: string;
  color: string;
  content: string;
  created_at: string;
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
