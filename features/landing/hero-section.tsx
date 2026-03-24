"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCreateSession } from "@/hooks/use-sessions";
import { useUserStore } from "@/stores/user-store";
import { api } from "@/lib/api";
import { PALETTE } from "@/lib/colors";
import { generateSessionName } from "@/lib/session-names";
import {
  trackJoinDialogOpen,
  trackJoinFromLanding,
  trackSessionCreated,
  trackUserCreatedGuest,
} from "@/lib/analytics";
import { extractSessionCode } from "@/lib/join-code";
import { useLandingHeroActions } from "./landing-hero-actions-context";

function randomColorName() {
  return PALETTE[Math.floor(Math.random() * PALETTE.length)].name;
}

export function HeroSection() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = useUserStore((s) => s.userId);
  const setUser = useUserStore((s) => s.setUser);
  const createSession = useCreateSession();
  const { register, unregister } = useLandingHeroActions();

  const [displayName, setDisplayName] = useState("");
  const [creatingUser, setCreatingUser] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinInput, setJoinInput] = useState("");

  useEffect(() => {
    if (searchParams.get("join") !== "1") return;
    setJoinOpen(true);
    router.replace("/", { scroll: false });
  }, [searchParams, router]);

  async function handleCreate() {
    if (!userId) {
      const trimmed = displayName.trim();
      if (!trimmed) {
        toast.error("Please enter your name to continue.");
        return;
      }

      setCreatingUser(true);
      try {
        const user = await api.users.create(trimmed, randomColorName());
        setUser(user.id, user.display_name, user.color);
        trackUserCreatedGuest();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Failed to create user",
        );
        setCreatingUser(false);
        return;
      }
      setCreatingUser(false);
    }

    createSession.mutate(
      { name: generateSessionName(), language: "typescript" },
      {
        onSuccess: (session) => {
          trackSessionCreated("hero");
          setDisplayName("");
          router.push(`/sessions/${session.short_id}`);
        },
      },
    );
  }

  function handleJoin() {
    const raw = joinInput.trim();
    if (!raw) return;
    const code = extractSessionCode(raw);
    if (!code) {
      toast.error("Invalid session code or link.");
      return;
    }
    trackJoinFromLanding("hero");
    setJoinOpen(false);
    setJoinInput("");
    router.push(`/sessions/${code}`);
  }

  const handleCreateRef = useRef(handleCreate);
  handleCreateRef.current = handleCreate;

  useEffect(() => {
    register({
      createSession: () => {
        void handleCreateRef.current();
      },
      openJoinDialog: () => setJoinOpen(true),
    });
    return unregister;
  }, [register, unregister]);

  const isPending = creatingUser || createSession.isPending;

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
          {!userId && (
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="What should we call you?"
              disabled={isPending}
              className="w-full h-12 rounded-full bg-white border border-[#DFDDD7] px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-[#9CA3AF]"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          )}
          <div id="create-session" className="flex scroll-mt-28 gap-3">
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={isPending}
              className="h-12 px-7 text-[15px]"
            >
              {isPending && <Spinner />}
              {isPending ? "Creating..." : "Create Session"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                trackJoinDialogOpen("hero");
                setJoinOpen(true);
              }}
              className="h-12 px-7 text-[15px]"
            >
              Join Session
            </Button>
          </div>
        </div>
      </section>

      {/* Join session dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">Join a session</DialogTitle>
            <DialogDescription>
              Enter the session code or link shared with you.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value)}
            placeholder="e.g. abc-def-ghj or paste link"
            autoFocus
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button
            onClick={handleJoin}
            disabled={!joinInput.trim()}
            className="h-12 w-full"
          >
            Join Session
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
