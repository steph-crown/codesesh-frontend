"use client";

import type { Session } from "@/lib/sessions";
import { SessionCard } from "./session-card";

export function SessionGrid({
  sessions,
  onRename,
  onDelete,
}: Readonly<{
  sessions: Session[];
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}>) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-lg font-medium text-[#0A0A0A]">No sessions yet</p>
        <p className="mt-2 text-sm text-[#9CA3AF]">
          Create your first coding session to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {sessions.map((s) => (
        <SessionCard
          key={s.id}
          session={s}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
