/** Build `ws://` / `wss://` base from `NEXT_PUBLIC_API_URL` (same host as REST). */
export function getWsBaseUrl(): string {
  const http =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL
      : "http://localhost:8080";
  return http.replace(/^http/, "ws");
}

export function getSessionWsUrl(shortId: string, userId: string): string {
  const base = getWsBaseUrl().replace(/\/$/, "");
  return `${base}/api/sessions/${encodeURIComponent(shortId)}/ws?user_id=${encodeURIComponent(userId)}`;
}
