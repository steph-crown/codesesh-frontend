"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useCreateSession } from "@/hooks/use-sessions";

export function HeroSection() {
  const router = useRouter();
  const requireAuth = useRequireAuth();
  const createSession = useCreateSession();
  const [joinOpen, setJoinOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");

  function handleCreate() {
    const name = sessionName.trim();
    if (!name) return;
    setCreateOpen(false);
    setSessionName("");
    createSession.mutate(
      { name, language: "typescript" },
      {
        onSuccess: (session) => {
          router.push(`/sessions/${session.id}`);
        },
      },
    );
  }

  function handleJoin() {
    const sid = sessionId.trim();
    if (!sid) return;
    setJoinOpen(false);
    setSessionId("");
    router.push(`/sessions/${sid}`);
  }

  return (
    <>
      <section className="relative flex min-h-svh flex-col items-center justify-center bg-[#FBF6F2] px-5 pt-[72px] text-center md:min-h-0 md:flex-1 md:px-6">
        <span className="mb-6 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Real-time pair programming
        </span>
        <h1 className="max-w-[800px] text-4xl font-bold leading-[1.1] tracking-tight text-[#0A0A0A] sm:text-5xl md:text-[56px]">
          Code together, instantly.
        </h1>
        <p className="mt-6 max-w-[560px] text-base leading-relaxed text-[#4B5563]">
          Create a live coding session and share the link. Your teammate joins
          in seconds&nbsp;&mdash; no signup, no setup.
        </p>

        <div className="mt-10 flex w-full max-w-[400px] flex-col items-center gap-4">
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={() => requireAuth(() => setCreateOpen(true))}
              className="h-12 px-7 text-[15px]"
            >
              Create Session
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setJoinOpen(true)}
              className="h-12 px-7 text-[15px]"
            >
              Join Session
            </Button>
          </div>
        </div>
      </section>

      {/* Create session dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">New session</DialogTitle>
            <DialogDescription>
              Give your coding session a name.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="e.g. React Dashboard"
            autoFocus
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button
            onClick={handleCreate}
            disabled={createSession.isPending}
            className="h-12 w-full"
          >
            {createSession.isPending ? "Creating..." : "Create Session"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Join session dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Join a session</DialogTitle>
            <DialogDescription>
              Enter the session ID shared with you to join.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Paste session ID"
            autoFocus
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button onClick={handleJoin} className="h-12 w-full">
            Join Session
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
