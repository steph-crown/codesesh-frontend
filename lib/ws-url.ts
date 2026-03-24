import { API_BASE_URL } from "./api-base-url";

/** Build `ws://` / `wss://` base from the same host as REST (`API_BASE_URL`). */
export function getWsBaseUrl(): string {
  return API_BASE_URL.replace(/^http/, "ws");
}

export function getSessionWsUrl(shortId: string, userId: string): string {
  const base = getWsBaseUrl().replace(/\/$/, "");
  return `${base}/api/sessions/${encodeURIComponent(shortId)}/ws?user_id=${encodeURIComponent(userId)}`;
}
