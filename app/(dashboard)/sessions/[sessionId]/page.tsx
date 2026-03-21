"use client";

import { use, useEffect } from "react";
import { useSession, useJoinSession } from "@/hooks/use-sessions";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useUserStore } from "@/stores/user-store";
import { Spinner } from "@/components/ui/spinner";
import { SessionPage } from "@/features/session/session-page";

export default function SessionRoute({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const userId = useUserStore((s) => s.userId);
  const hasHydrated = useUserStore((s) => s._hasHydrated);
  const requireAuth = useRequireAuth();
  const joinSession = useJoinSession();
  const { data: session, isLoading, error } = useSession(sessionId);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!userId) {
      requireAuth(() => {});
    }
  }, [hasHydrated, userId, requireAuth]);

  useEffect(() => {
    if (userId && sessionId) {
      joinSession.mutate(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, sessionId]);

  if (!hasHydrated || isLoading) {
    return (
      <div className="dark flex size-full items-center justify-center bg-[#020617]">
        <Spinner className="size-6 text-white/60" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="dark flex size-full items-center justify-center bg-[#020617]">
        <p className="text-sm text-[#9CA3AF]">
          Enter your name to join this session.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dark flex size-full flex-col items-center justify-center gap-2 bg-[#020617]">
        <p className="text-lg font-medium text-[#F9FAFB]">
          Session not found
        </p>
        <p className="text-sm text-[#9CA3AF]">
          This session may have been deleted or you don&apos;t have access.
        </p>
      </div>
    );
  }

  if (!session) return null;

  return <SessionPage session={session} sessionId={sessionId} />;
}
