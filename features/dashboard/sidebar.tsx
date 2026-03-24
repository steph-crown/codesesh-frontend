"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlusSignIcon,
  Login01Icon,
  Search01Icon,
  Folder02Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSidebar } from "@/hooks/use-sidebar";
import {
  useSessions,
  useCreateSession,
  useJoinSession,
} from "@/hooks/use-sessions";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useUserStore } from "@/stores/user-store";
import { getColorByName } from "@/lib/colors";
import { generateSessionName } from "@/lib/session-names";
import { extractSessionCode } from "@/lib/join-code";
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
  const pathname = usePathname();
  const { collapsed, toggle, mobileOpen, setMobileOpen } = useSidebar();
  const { data: sessionsData } = useSessions();
  const userId = useUserStore((s) => s.userId);
  const displayName = useUserStore((s) => s.displayName);
  const userColor = useUserStore((s) => s.color);
  const requireAuth = useRequireAuth();
  const createSession = useCreateSession();
  const joinSession = useJoinSession();

  const sessions = sessionsData?.data ?? [];

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinInput, setJoinInput] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchData } = useSessions(
    searchQuery.trim() ? { search: searchQuery.trim() } : undefined,
  );
  const searchResults = searchQuery.trim()
    ? (searchData?.data ?? [])
    : sessions;

  function handleNewSession() {
    requireAuth(() => {
      createSession.mutate(
        { name: generateSessionName(), language: "typescript" },
        {
          onSuccess: (session) => {
            router.push(`/sessions/${session.short_id}`);
          },
        },
      );
    });
  }

  function handleJoin() {
    const raw = joinInput.trim();
    if (!raw) return;
    const code = extractSessionCode(raw);
    if (!code) {
      toast.error("Invalid session code or link.");
      return;
    }
    joinSession.mutate(code, {
      onSuccess: () => {
        setJoinOpen(false);
        setJoinInput("");
        router.push(`/sessions/${code}`);
      },
      onError: () => {
        setJoinOpen(false);
        setJoinInput("");
        router.push(`/sessions/${code}`);
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
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo-with-text.svg"
              alt="CodeSesh"
              width={103.2}
              height={32}
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
            className={cn("transition-transform", !showLabels && "rotate-180")}
          />
        </button>
      </div>

      {/* Actions */}
      <div
        className={cn("flex flex-col gap-1 p-2", !showLabels && "items-center")}
      >
        <button
          onClick={handleNewSession}
          disabled={createSession.isPending}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#FAF5F0] disabled:opacity-50",
            !showLabels && "w-10 justify-center px-0",
          )}
        >
          {createSession.isPending ? (
            <Spinner className="size-[18px]" />
          ) : (
            <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} />
          )}
          {showLabels &&
            (createSession.isPending ? "Creating..." : "New session")}
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
        <Link
          href="/my-sessions"
          onClick={() => setMobileOpen(false)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
            pathname === "/my-sessions"
              ? "bg-[#FAF5F0] text-[#0A0A0A]"
              : "text-[#0A0A0A] hover:bg-[#FAF5F0]",
            !showLabels && "w-10 justify-center px-0",
          )}
        >
          <HugeiconsIcon icon={Folder02Icon} size={18} strokeWidth={2} />
          {showLabels && "My Sessions"}
        </Link>
      </div>

      {/* Recent sessions */}
      {showLabels && (
        <div className="flex-1 overflow-y-auto px-2 pt-2">
          <p className="px-2.5 pb-2 text-[10px] font-medium uppercase tracking-wider text-[#9CA3AF]">
            Recent sessions
          </p>
          <div className="flex flex-col gap-0.5">
            {recent.map((s) => {
              const active = pathname === `/sessions/${s.short_id}`;
              return (
                <Link
                  key={s.id}
                  href={`/sessions/${s.short_id}`}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "block truncate rounded-lg px-2.5 py-1.5 text-sm transition-colors",
                    active
                      ? "bg-[#FAF5F0] font-medium text-[#0A0A0A]"
                      : "text-[#4B5563] hover:bg-[#FAF5F0] hover:text-[#0A0A0A]",
                  )}
                >
                  {s.name}
                </Link>
              );
            })}
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
            color={userColor ? getColorByName(userColor) : undefined}
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

      {/* Join session dialog */}
      <Dialog
        open={joinOpen}
        onOpenChange={(o) => {
          if (!joinSession.isPending) setJoinOpen(o);
        }}
      >
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
            disabled={joinSession.isPending}
            className="h-12 w-full rounded-full border-[1.5px] border-primary bg-white px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF] disabled:opacity-50"
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
          />
          <Button
            onClick={handleJoin}
            disabled={joinSession.isPending || !joinInput.trim()}
            className="h-12 w-full"
          >
            {joinSession.isPending && <Spinner />}
            {joinSession.isPending ? "Joining..." : "Join Session"}
          </Button>
        </DialogContent>
      </Dialog>

      {/* Command palette */}
      <CommandDialog
        open={searchOpen}
        onOpenChange={(o) => {
          setSearchOpen(o);
          if (!o) setSearchQuery("");
        }}
      >
        <CommandInput
          placeholder="Search sessions..."
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          <CommandEmpty>No sessions found.</CommandEmpty>
          <CommandGroup heading="Sessions">
            {searchResults.map((s) => (
              <CommandItem
                key={s.id}
                value={s.name}
                onSelect={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                  router.push(`/sessions/${s.short_id}`);
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
