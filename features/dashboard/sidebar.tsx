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
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useSidebar } from "@/hooks/use-sidebar";
import { useSessions, useUser } from "@/hooks/use-sessions";
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
  const { collapsed, toggle } = useSidebar();
  const { sessions, createSession } = useSessions();
  const user = useUser();

  const [joinOpen, setJoinOpen] = useState(false);
  const [joinId, setJoinId] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  function handleCreate() {
    const name = newUsername.trim();
    if (!name) return;
    const session = createSession(name);
    setCreateOpen(false);
    setNewUsername("");
    router.push(`/sessions/${session.id}`);
  }

  function handleJoin() {
    const sid = joinId.trim();
    if (!sid) return;
    setJoinOpen(false);
    setJoinId("");
    router.push(`/sessions/${sid}`);
  }

  const recent = sessions.slice(0, 10);

  return (
    <>
      <aside
        className={cn(
          "flex flex-col h-svh bg-white border-r border-[#E5E0DA] transition-all duration-200 shrink-0",
          collapsed ? "w-[60px]" : "w-[260px]",
        )}
      >
        {/* Logo + collapse */}
        <div
          className={cn(
            "flex items-center h-14 border-b border-[#E5E0DA] px-3",
            collapsed ? "justify-center" : "justify-between",
          )}
        >
          <Link href="/my-sessions" className="flex items-center gap-2">
            <Image
              src="/logo-icon.svg"
              alt="CodeSesh"
              width={28}
              height={28}
            />
          </Link>
          <button
            onClick={toggle}
            className="p-1.5 rounded-lg hover:bg-[#FAF5F0] transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Image
              src="/collapse.svg"
              alt=""
              width={18}
              height={18}
              className={cn(
                "transition-transform",
                collapsed && "rotate-180",
              )}
            />
          </button>
        </div>

        {/* Actions */}
        <div className={cn("flex flex-col gap-1 p-2", collapsed && "items-center")}>
          <button
            onClick={() => setCreateOpen(true)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] hover:bg-[#FAF5F0] transition-colors w-full",
              collapsed && "justify-center w-10 px-0",
            )}
          >
            <HugeiconsIcon icon={PlusSignIcon} size={18} strokeWidth={2} />
            {!collapsed && "New session"}
          </button>
          <button
            onClick={() => setJoinOpen(true)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] hover:bg-[#FAF5F0] transition-colors w-full",
              collapsed && "justify-center w-10 px-0",
            )}
          >
            <HugeiconsIcon icon={Login01Icon} size={18} strokeWidth={2} />
            {!collapsed && "Join session"}
          </button>
          <button
            onClick={() => setSearchOpen(true)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-[#0A0A0A] hover:bg-[#FAF5F0] transition-colors w-full",
              collapsed && "justify-center w-10 px-0",
            )}
          >
            <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={2} />
            {!collapsed && "Search"}
          </button>
        </div>

        {/* Recent sessions */}
        {!collapsed && (
          <div className="flex-1 overflow-y-auto px-2 pt-2">
            <p className="px-2.5 pb-2 text-xs font-medium text-[#9CA3AF] uppercase tracking-wider">
              Recent sessions
            </p>
            <div className="flex flex-col gap-0.5">
              {recent.map((s) => (
                <Link
                  key={s.id}
                  href={`/sessions/${s.id}`}
                  className="block truncate rounded-lg px-2.5 py-1.5 text-sm text-[#4B5563] hover:bg-[#FAF5F0] hover:text-[#0A0A0A] transition-colors"
                >
                  {s.title}
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

        {collapsed && <div className="flex-1" />}

        {/* User profile */}
        <div
          className={cn(
            "border-t border-[#E5E0DA] p-3",
            collapsed ? "flex justify-center" : "flex items-center gap-3",
          )}
        >
          <Avatar size="sm">
            <AvatarFallback>
              {user ? getInitials(user.username) : "?"}
            </AvatarFallback>
          </Avatar>
          {!collapsed && user && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#0A0A0A]">
                {user.username}
              </p>
              <p className="text-xs text-[#9CA3AF]">
                {sessions.length} {sessions.length === 1 ? "session" : "sessions"}
              </p>
            </div>
          )}
        </div>
      </aside>

      {/* Create session dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl">New session</DialogTitle>
            <DialogDescription>
              Enter your display name to create a new coding session.
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="What should we call you?"
            autoFocus
            className="w-full h-12 rounded-full bg-white border-[1.5px] border-primary px-5 text-[15px] outline-none transition-shadow focus:ring-2 focus:ring-primary/40 placeholder:text-[#9CA3AF]"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <Button onClick={handleCreate} className="w-full h-12">
            Create Session
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

      {/* Command palette */}
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <CommandInput placeholder="Search sessions..." />
        <CommandList>
          <CommandEmpty>No sessions found.</CommandEmpty>
          <CommandGroup heading="Sessions">
            {sessions.map((s) => (
              <CommandItem
                key={s.id}
                value={s.title}
                onSelect={() => {
                  setSearchOpen(false);
                  router.push(`/sessions/${s.id}`);
                }}
              >
                {s.title}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
