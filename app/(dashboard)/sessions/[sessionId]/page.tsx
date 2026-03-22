"use client";

import { use, useEffect, useRef, useState } from "react";
import { useSession, useJoinSession } from "@/hooks/use-sessions";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useUserStore } from "@/stores/user-store";
import { ApiError } from "@/lib/api-client";
import { SessionPage } from "@/features/session/session-page";
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
  const hasShownEndedToastRef = useRef(false);
  const [joinErrorEntry, setJoinErrorEntry] = useState<{
    sid: string;
    error: ApiError;
  } | null>(null);
  const joinError =
    joinErrorEntry?.sid === sessionId ? joinErrorEntry.error : null;

  // Step 1 — Identity check: if no userId, prompt for name
  useEffect(() => {
    if (!userId) {
      requireAuth(() => {});
    }
  }, [userId, requireAuth]);

  // Step 5 — Join session (only after session data is available and checks pass)
  useEffect(() => {
    if (!userId || !session || hasJoinedRef.current) return;
    if (!shouldJoin(session)) return;

    hasJoinedRef.current = true;

    joinSession.mutateAsync(sessionId).catch((err) => {
      if (err instanceof ApiError) {
        setJoinErrorEntry({ sid: sessionId, error: err });
      }
    });
  }, [userId, session, sessionId, joinSession]);

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

  // Reset join guard when sessionId changes (navigating between sessions)
  useEffect(() => {
    hasJoinedRef.current = false;
    hasShownEndedToastRef.current = false;
  }, [sessionId]);

  // Step 1 continued — waiting for identity or session fetch
  if (!userId || isLoading) {
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
      <SessionPage session={session} sessionId={sessionId} readOnly />
    );
  }
  if (joinError?.status === 403) {
    return <SessionRouteNotFound />;
  }

  // Step 6 — Render with readOnly computed from visibility + ownership + status
  // WebSocket not implemented yet — do NOT connect for any state
  return (
    <SessionPage
      session={session}
      sessionId={sessionId}
      readOnly={computeReadOnly(session)}
    />
  );
}
