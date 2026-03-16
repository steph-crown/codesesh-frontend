"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { useSessions, useUser, useChatMessages } from "@/hooks/use-sessions";
import { SessionPage } from "@/features/session/session-page";

export default function SessionRoute({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { sessions } = useSessions();
  const user = useUser();
  const messages = useChatMessages();

  const session = sessions.find((s) => s.id === sessionId);

  if (!session) {
    notFound();
  }

  return (
    <SessionPage
      session={session}
      messages={messages}
      currentUser={user.username}
    />
  );
}
