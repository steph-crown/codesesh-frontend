"use client";

import { use, useEffect, useRef, useState } from "react";
import { useSession, useJoinSession } from "@/hooks/use-sessions";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useAuthReady } from "@/hooks/use-auth-ready";
import { useUserPersistHydrated } from "@/hooks/use-user-persist-hydrated";
import { useUserStore } from "@/stores/user-store";
import { ApiError } from "@/lib/api-client";
import { SessionPage } from "@/features/session/session-page";
import { SessionProvider } from "@/contexts/session-context";
import { SessionRouteLoading } from "@/features/session/session-route-loading";
import { SessionRouteNotFound } from "@/features/session/session-route-not-found";
import { SessionRouteError } from "@/features/session/session-route-error";
import { toast } from "sonner";

function shouldJoin(
  session: { status: string; visibility: string; is_owner: boolean },
) {
  if (session.status === "ended") return false;
  if (session.visibility === "private" && !session.is_owner) return false;
  return true;
}

function computeReadOnly(
  session: { status: string; visibility: string; is_owner: boolean },
) {
  if (session.status === "ended") return true;
  if (session.visibility === "view_only" && !session.is_owner) return true;
  return false;
}

export default function SessionRoute({
  params,
}: Readonly<{
  params: Promise<{ sessionId: string }>;
}>) {
  const { sessionId } = use(params);
  const hydrated = useUserPersistHydrated();
  const authReady = useAuthReady();
  const userId = useUserStore((s) => s.userId);
  const requireAuth = useRequireAuth();
  const joinSession = useJoinSession();
  const {
    data: session,
    isLoading,
    error,
    refetch,
  } = useSession(sessionId);

  const hasJoinedRef = useRef(false);
  /** Mirrors route `sessionId` for async join callbacks (TanStack mutation `variables` can lag the URL). */
  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const prevSessionIdForJoinResetRef = useRef<string | null>(null);
  const hasShownEndedToastRef = useRef(false);
  /**
   * Which sessionId we've successfully POST /join'd for this visit.
   * Do not use `joinSession.isSuccess && joinSession.variables` for gating WS: the global
   * mutation state can disagree with the URL for a render (cache + reset ordering), causing
   * stuck "Connecting" when navigating back to a session.
   */
  const [joinedSessionId, setJoinedSessionId] = useState<string | null>(null);
  const [joinErrorEntry, setJoinErrorEntry] = useState<{
    sid: string;
    error: ApiError;
  } | null>(null);
  const joinError =
    joinErrorEntry?.sid === sessionId ? joinErrorEntry.error : null;

  // Identity: after rehydration, if there is truly no user id, open the modal.
  // Do NOT call requireAuth synchronously when !authReady: right after hydration,
  // `hasHydrated()` / `hydrated` can be true while `userId` is still briefly null in
  // the React subscription (and Fast Refresh can widen that gap). Defer + re-read
  // the store so we don't flash the modal for returning users.
  useEffect(() => {
    if (!hydrated) return;
    if (authReady) return;

    let cancelled = false;
    const t = globalThis.window.setTimeout(() => {
      if (cancelled) return;
      if (useUserStore.getState().userId) return;
      requireAuth(() => {});
    }, 0);

    return () => {
      cancelled = true;
      globalThis.window.clearTimeout(t);
    };
  }, [hydrated, authReady, requireAuth]);

  // Reset join guard when sessionId changes. MUST run before the join effect below:
  // otherwise the join effect sees hasJoinedRef still true from the previous session
  // and skips calling joinSession for the new route (joinReady / ws stay false forever).
  useEffect(() => {
    if (prevSessionIdForJoinResetRef.current === null) {
      prevSessionIdForJoinResetRef.current = sessionId;
      return;
    }
    if (prevSessionIdForJoinResetRef.current === sessionId) return;
    prevSessionIdForJoinResetRef.current = sessionId;
    hasJoinedRef.current = false;
    hasShownEndedToastRef.current = false;
    setJoinedSessionId(null);
    joinSession.reset();
  }, [sessionId, joinSession]);

  // Join session (only after session data is available and checks pass)
  useEffect(() => {
    if (!userId || !session) return;

    if (session.status === "ended") {
      return;
    }

    if (!shouldJoin(session)) {
      return;
    }

    if (hasJoinedRef.current) return;
    hasJoinedRef.current = true;

    const targetId = sessionId;
    joinSession
      .mutateAsync(targetId)
      .then(() => {
        if (sessionIdRef.current === targetId) {
          setJoinedSessionId(targetId);
        }
      })
      .catch((err) => {
        hasJoinedRef.current = false;
        if (err instanceof ApiError) {
          setJoinErrorEntry({ sid: targetId, error: err });
        }
      });
  }, [userId, session, sessionId, joinSession]);

  const joinReady =
    session?.status === "ended" || joinedSessionId === sessionId;

  // Show toast once when an ended session is detected
  useEffect(() => {
    if (session?.status === "ended" && !hasShownEndedToastRef.current) {
      hasShownEndedToastRef.current = true;
      toast.info("This session has ended");
    }
  }, [session?.status]);

  // Show toast for join 410 race condition
  useEffect(() => {
    if (joinError?.status === 410) {
      toast.info("This session has ended");
    }
  }, [joinError]);

  // Wait until persist + user id before session query (and avoid identity flash)
  if (!authReady || isLoading) {
    return <SessionRouteLoading />;
  }

  // Step 2 — Handle fetch errors
  if (error) {
    // 401 — user cleared from DB, identity dialog will show via api-client
    if (error instanceof ApiError && error.code === "USER_NOT_FOUND") {
      return <SessionRouteLoading />;
    }

    // 404 / 403 — session not found or private
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 403)
    ) {
      return <SessionRouteNotFound />;
    }

    // Network or server error — show retry
    return <SessionRouteError onRetry={() => refetch()} />;
  }

  if (!session) return null;

  // Step 4 — Private session, non-owner: show not found
  if (session.visibility === "private" && !session.is_owner) {
    return <SessionRouteNotFound />;
  }

  // Step 5 — Handle join errors (race conditions)
  if (joinError?.status === 410) {
    return (
      <SessionProvider
        session={session}
        sessionId={sessionId}
        userId={userId ?? ""}
        enabled={false}
      >
        <SessionPage session={session} sessionId={sessionId} readOnly />
      </SessionProvider>
    );
  }
  if (joinError?.status === 403) {
    return <SessionRouteNotFound />;
  }

  // Step 6 — WebSocket after REST join succeeds (active sessions only)
  const wsEnabled =
    joinReady && session.status === "active" && !!userId;

  return (
    <SessionProvider
      session={session}
      sessionId={sessionId}
      userId={userId!}
      enabled={wsEnabled}
    >
      <SessionPage
        session={session}
        sessionId={sessionId}
        readOnly={computeReadOnly(session)}
      />
    </SessionProvider>
  );
}
