"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  Share08Icon,
  Logout01Icon,
  MoreVerticalIcon,
  Notification03Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Session } from "@/lib/sessions";
import { getColorForUser } from "@/lib/colors";
import { LanguageSelector } from "./language-selector";
import {
  ConnectionIndicator,
  type ConnectionStatus,
} from "./connection-indicator";
import { PingMenu } from "./ping-menu";
import { ShareDialog } from "./share-dialog";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SessionToolbar({
  session,
  language,
  onLanguageChange,
  onRun,
  connectionStatus = "connected",
}: {
  session: Session;
  language: string;
  onLanguageChange: (lang: string) => void;
  onRun: () => void;
  connectionStatus?: ConnectionStatus;
}) {
  const router = useRouter();
  const [shareOpen, setShareOpen] = useState(false);
  const [privacy, setPrivacy] = useState(session.privacy);
  const [title, setTitle] = useState(session.title);
  const [editingTitle, setEditingTitle] = useState(false);

  return (
    <>
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/5 bg-[#111827] px-3">
        {/* Left section: title + language + run */}
        <div className="flex min-w-0 items-center gap-1">
          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingTitle(false);
                if (e.key === "Escape") {
                  setTitle(session.title);
                  setEditingTitle(false);
                }
              }}
              className="h-7 w-32 shrink-0 rounded-md bg-white/10 px-2 text-sm font-medium text-[#F9FAFB] outline-none ring-1 ring-[#ff3c00]/50 md:w-40"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="truncate rounded-md px-2 py-1 text-sm font-medium text-[#F9FAFB] transition-colors hover:bg-white/5"
            >
              {title}
            </button>
          )}

          <span className="mx-1 text-[#4B5563]">/</span>
          <LanguageSelector value={language} onChange={onLanguageChange} />

          <button
            onClick={onRun}
            className="ml-1 flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/60"
          >
            <HugeiconsIcon icon={PlayIcon} size={12} strokeWidth={2.5} />
            Run
          </button>
        </div>

        {/* Right section: desktop — full toolbar */}
        <div className="hidden items-center gap-2 md:flex">
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-[#F9FAFB]"
          >
            <HugeiconsIcon icon={Share08Icon} size={14} strokeWidth={2} />
            Share
          </button>

          <div className="h-4 w-px bg-white/10" />

          <AvatarGroup>
            {session.contributors.slice(0, 4).map((c) => {
              const color = getColorForUser(c.username);
              return (
                <Avatar key={c.username} size="sm">
                  <AvatarFallback color={color}>
                    {getInitials(c.username)}
                  </AvatarFallback>
                </Avatar>
              );
            })}
          </AvatarGroup>

          <div className="h-4 w-px bg-white/10" />

          <ConnectionIndicator status={connectionStatus} />

          <div className="h-4 w-px bg-white/10" />

          <PingMenu contributors={session.contributors} onPing={() => {}} />

          <div className="h-4 w-px bg-white/10" />

          <button
            onClick={() => router.push("/my-sessions")}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-[#DC2626]"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={2} />
            Leave
          </button>
        </div>

        {/* Right section: mobile — overflow menu */}
        <Popover>
          <PopoverTrigger className="flex items-center rounded-md p-1.5 text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-[#F9FAFB] md:hidden">
            <HugeiconsIcon icon={MoreVerticalIcon} size={18} strokeWidth={2} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-56 gap-0 rounded-lg! border-white/10! bg-[#111827]! p-1.5"
          >
            {/* Collaborators */}
            <div className="flex items-center gap-2 px-2.5 py-2">
              <AvatarGroup>
                {session.contributors.slice(0, 4).map((c) => {
                  const color = getColorForUser(c.username);
                  return (
                    <Avatar key={c.username} size="sm">
                      <AvatarFallback color={color}>
                        {getInitials(c.username)}
                      </AvatarFallback>
                    </Avatar>
                  );
                })}
              </AvatarGroup>
              <span className="text-xs text-[#9CA3AF]">
                {session.contributors.length} collaborator
                {session.contributors.length !== 1 && "s"}
              </span>
            </div>

            <div className="my-1 h-px bg-white/10" />

            {/* Connection status */}
            <div className="flex items-center gap-2.5 px-2.5 py-2">
              <ConnectionIndicator status={connectionStatus} />
            </div>

            <div className="my-1 h-px bg-white/10" />

            {/* Share */}
            <button
              onClick={() => setShareOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#F9FAFB] transition-colors hover:bg-white/5"
            >
              <HugeiconsIcon icon={Share08Icon} size={14} strokeWidth={2} />
              Share
            </button>

            {/* Ping */}
            <button
              onClick={() => {}}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#F9FAFB] transition-colors hover:bg-white/5"
            >
              <HugeiconsIcon
                icon={Notification03Icon}
                size={14}
                strokeWidth={2}
              />
              Ping everyone
            </button>

            <div className="my-1 h-px bg-white/10" />

            {/* Leave */}
            <button
              onClick={() => router.push("/my-sessions")}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#DC2626] transition-colors hover:bg-white/5"
            >
              <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={2} />
              Leave session
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        sessionId={session.id}
        privacy={privacy}
        onPrivacyChange={setPrivacy}
      />
    </>
  );
}
