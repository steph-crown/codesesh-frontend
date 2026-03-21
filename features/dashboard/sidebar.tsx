"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Login01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useSessions, useCreateSession, useJoinSession } from "@/hooks/use-sessions";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useUserStore } from "@/stores/user-store";
import { getColorForUser } from "@/lib/colors";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar() {
  const router = useRouter();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();
  const { data: sessionsData } = useSessions();
  const userId = useUserStore((s) => s.userId);
  const displayName = useUserStore((s) => s.displayName);
  const requireAuth = useRequireAuth();
  const createSession = useCreateSession();
  const joinSession = useJoinSession();

  const sessions = sessionsData?.data ?? [];

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
    const sid = joinId.trim();
    if (!sid) return;
    setJoinOpen(false);
    setJoinId("");
    joinSession.mutate(sid, {
      onSuccess: () => {
        router.push(`/sessions/${sid}`);
      },
      onError: () => {
        router.push(`/sessions/${sid}`);
      },
    });
  }

  const recent = sessions.slice(0, 10);
  const showLabels = mobileOpen || !collapsed;

  const sidebarContent = (
    <>
      {/* Logo + collapse */}
      <div
        className={cn(
          "flex h-14 items-center border-b border-[#E5E0DA] px-3",
          showLabels ? "justify-between" : "justify-center",
        )}
      >
        {showLabels && (
          <Link href="/my-sessions" className="flex items-center gap-2">
            <Image
              src="/logo-icon.svg"
              alt="CodeSesh"
              width={28}
              height={28}
            />
          </Link>
        )}
        <button
          onClick={() => {
            if (mobileOpen) {
              setMobileOpen(false);
            } else {
              toggle();
            }
          }}
          className="rounded-lg p-1.5 transition-colors hover:bg-[#FAF5F0]"
          aria-label={showLabels ? "Collapse sidebar" : "Expand sidebar"}
        >
          <Image
            src="/collapse.svg"
            alt=""
            width={18}
            height={18}
            className={cn(
              "transition-transform",
              !showLabels && "rotate-180",
            )}
          />
        </button>
      </div>

      {/* Actions */}
      <div
        className={cn(
          "flex flex-col gap-1 p-2",
          !showLabels && "items-center",
        )}
      >
        <button
          onClick={() => requireAuth(() => setCreateOpen(true))}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#FAF5F0]",
            !showLabels && "w-10 justify-center px-0",
          )}
        >
          <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} />
          {showLabels && "New session"}
        </button>
        <button
          onClick={() => requireAuth(() => setJoinOpen(true))}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#FAF5F0]",
            !showLabels && "w-10 justify-center px-0",
          )}
        >
          <HugeiconsIcon icon={Login01Icon} size={18} strokeWidth={2} />
          {showLabels && "Join session"}
        </button>
        <button
          onClick={() => setSearchOpen(true)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#FAF5F0]",
            !showLabels && "w-10 justify-center px-0",
          )}
        >
          <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2} />
          {showLabels && "Search"}
        </button>
      </div>

      {/* Recent sessions */}
      {showLabels && (
        <div className="flex-1 overflow-y-auto px-2 pt-2">
          <p className="px-2.5 pb-2 text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
            Recent sessions
          </p>
          <div className="flex flex-col gap-0.5">
            {recent.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                onClick={() => setMobileOpen(false)}
                className="block truncate rounded-lg px-2.5 py-1.5 text-sm text-[#4B5563] transition-colors hover:bg-[#FAF5F0] hover:text-[#0A0A0A]"
              >
                {s.name}
              </Link>
            ))}
            {recent.length === 0 && (
              <p className="px-2.5 py-1.5 text-sm text-[#9CA3AF]">
                No sessions yet
              </p>
            )}
          </div>
        </div>
      )}

      {!showLabels && <div className="flex-1" />}

      {/* User profile */}
      <div
        className={cn(
          "border-t border-[#E5E0DA] p-3",
          showLabels ? "flex items-center gap-3" : "flex justify-center",
        )}
      >
        <Avatar size="sm">
          <AvatarFallback
            color={displayName ? getColorForUser(displayName) : undefined}
          >
            {displayName ? getInitials(displayName) : "?"}
          </AvatarFallback>
        </Avatar>
        {showLabels && userId && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#0A0A0A]">
              {displayName}
            </p>
            <p className="text-xs text-[#9CA3AF]">
              {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-full flex-col bg-white transition-transform duration-200 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-svh shrink-0 flex-col border-r border-[#E5E0DA] bg-white transition-all duration-200 md:flex",
          collapsed ? "w-[60px]" : "w-[260px]",
        )}
      >
        {sidebarContent}
      </aside>

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
            value={joinId}
            onChange={(e) => setJoinId(e.target.value)}
            placeholder="Paste session ID"
            autoFocus
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button
            onClick={handleJoin}
            disabled={joinSession.isPending}
            className="h-12 w-full"
          >
            {joinSession.isPending ? "Joining..." : "Join Session"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Command palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search sessions..." />
        <CommandList>
          <CommandEmpty>No sessions found.</CommandEmpty>
          <CommandGroup heading="Sessions">
            {sessions.map((s) => (
              <CommandItem
                key={s.id}
                value={s.name}
                onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/sessions/${s.id}`);
                }}
              >
                {s.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
