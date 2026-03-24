/**
 * GA4 helpers. No-ops when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is unset (e.g. local dev).
 * Event names use GA4-style snake_case.
 */

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";

export function isGaEnabled(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<
  string,
  string | number | boolean | undefined | null
>;

/** Generic GA4 event (see https://developers.google.com/analytics/devguides/collection/ga4/reference/events) */
export function trackEvent(name: string, params?: EventParams): void {
  if (globalThis.window === undefined || !isGaEnabled()) return;
  const cleaned = params
    ? Object.fromEntries(
        Object.entries(params).filter(
          ([, v]) => v !== undefined && v !== null && v !== "",
        ),
      )
    : undefined;
  globalThis.window.gtag?.("event", name, cleaned);
}

export function trackUserCreatedGuest(): void {
  trackEvent("sign_up", { method: "guest_name" });
}

export function trackSessionCreated(source: "hero" | "my_sessions"): void {
  trackEvent("session_created", { source });
}

/** User confirmed join and navigated to a session code (hero join flow). */
export function trackJoinFromLanding(source: "hero"): void {
  trackEvent("join_session_start", { source });
}

/** Join dialog opened (e.g. mobile nav menu). */
export function trackJoinDialogOpen(source: "mobile_nav" | "hero"): void {
  trackEvent("join_dialog_open", { source });
}

export function trackCodeExecuted(params: {
  language: string;
  success: boolean;
  exit_code?: number;
}): void {
  trackEvent("code_executed", {
    language: params.language,
    success: params.success,
    exit_code: params.exit_code,
  });
}
