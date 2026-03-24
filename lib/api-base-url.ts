/**
 * HTTP base URL for the Rust API (REST). Used for rewrites, server-side fetch to the API,
 * and as the logical host for WebSocket URLs (see `lib/ws-url.ts`).
 *
 * Set `NEXT_PUBLIC_API_URL` in `.env` for non-local deployments (e.g. Railway).
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
