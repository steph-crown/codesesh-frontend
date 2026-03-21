import { apiFetch } from "./api-client";
import type {
  UserResponse,
  SessionDetail,
  SessionSummary,
  PaginatedResponse,
  Participant,
  MessageHistory,
  SessionVisibility,
  GetSessionsQuery,
  GetMessagesQuery,
} from "./api-types";

function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const search = new URLSearchParams();
  for (const [key, val] of Object.entries(params)) {
    if (val !== undefined && val !== "") search.set(key, String(val));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export const api = {
  users: {
    create: (displayName: string, color: string) =>
      apiFetch<UserResponse>("/users", {
        method: "POST",
        body: JSON.stringify({ display_name: displayName, color }),
      }),

    me: () => apiFetch<UserResponse>("/users/me"),
  },

  sessions: {
    list: (query?: GetSessionsQuery) =>
      apiFetch<PaginatedResponse<SessionSummary>>(
        `/sessions${toQueryString({
          search: query?.search,
          created_by_me: query?.created_by_me,
          shared_with_me: query?.shared_with_me,
          page: query?.page,
          limit: query?.limit,
        })}`,
      ),

    create: (name: string, language: string) =>
      apiFetch<SessionDetail>("/sessions", {
        method: "POST",
        body: JSON.stringify({ name, language }),
      }),

    get: (sessionId: string) =>
      apiFetch<SessionDetail>(`/sessions/${sessionId}`),

    updateName: (sessionId: string, name: string) =>
      apiFetch<SessionDetail>(`/sessions/${sessionId}/name`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
      }),

    updateVisibility: (sessionId: string, visibility: SessionVisibility) =>
      apiFetch<SessionDetail>(`/sessions/${sessionId}/visibility`, {
        method: "PATCH",
        body: JSON.stringify({ visibility }),
      }),

    end: (sessionId: string) =>
      apiFetch<SessionDetail>(`/sessions/${sessionId}/end`, {
        method: "PATCH",
      }),

    join: (sessionId: string) =>
      apiFetch<Participant>(`/sessions/${sessionId}/join`, {
        method: "POST",
      }),

    getParticipants: (sessionId: string) =>
      apiFetch<Participant[]>(`/sessions/${sessionId}/participants`),

    getMessages: (sessionId: string, query?: GetMessagesQuery) =>
      apiFetch<MessageHistory>(
        `/sessions/${sessionId}/messages${toQueryString({
          limit: query?.limit,
          before: query?.before,
        })}`,
      ),
  },
};
