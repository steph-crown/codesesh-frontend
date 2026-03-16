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

export function HeroSection() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [joinOpen, setJoinOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");

  function handleCreate() {
    const name = username.trim();
    if (!name) return;
    const id = crypto.randomUUID().slice(0, 8);
    const sessions = JSON.parse(
      localStorage.getItem("codesesh_sessions") || "[]",
    );
    sessions.push({ id, username: name, createdAt: Date.now() });
    localStorage.setItem("codesesh_sessions", JSON.stringify(sessions));
    router.push(`/sessions/${id}`);
  }

  function handleJoin() {
    const sid = sessionId.trim();
    if (!sid) return;
    router.push(`/sessions/${sid}`);
  }

  return (
    <>
      <section className="relative flex flex-col items-center justify-center min-h-svh bg-[#FBF6F2] px-6 pt-[72px] text-center">
        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold leading-[1.1] tracking-tight text-[#0A0A0A] max-w-[800px]">
          Code together, instantly.
        </h1>
        <p className="mt-6 text-base text-[#4B5563] max-w-[560px] leading-relaxed">
          Create a live coding session and share the link. Your teammate joins
          in seconds&nbsp;&mdash; no signup, no setup.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 w-full max-w-[400px]">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="What should we call you?"
            className="w-full h-12 rounded-full bg-white border border-[#DFDDD7] px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <div className="flex gap-3">
            <Button
              size="lg"
              onClick={handleCreate}
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
            placeholder="e.g. xk7p2"
            autoFocus
            className="w-full h-12 rounded-full bg-white border-[1.5px] border-primary px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button onClick={handleJoin} className="w-full h-12">
            Join Session
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
