"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PlayIcon,
  Share08Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar";
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
        {/* Left section */}
        <div className="flex items-center gap-1">
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
              className="h-7 w-40 rounded-md bg-white/10 px-2 text-sm font-medium text-[#F9FAFB] outline-none ring-1 ring-[#ff3c00]/50"
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="rounded-md px-2 py-1 text-sm font-medium text-[#F9FAFB] hover:bg-white/5 transition-colors"
            >
              {title}
            </button>
          )}

          <span className="mx-1 text-[#4B5563]">/</span>
          <LanguageSelector value={language} onChange={onLanguageChange} />

          <button
            onClick={onRun}
            className="ml-1 flex items-center gap-1.5 bg-primary px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-primary/60 rounded-full"
          >
            <HugeiconsIcon icon={PlayIcon} size={12} strokeWidth={2.5} />
            Run
          </button>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShareOpen(true)}
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
          >
            <HugeiconsIcon icon={Share08Icon} size={14} strokeWidth={2} />
            <span className="hidden sm:inline">Share</span>
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
            className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#DC2626] hover:bg-white/5 transition-colors"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} strokeWidth={2} />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
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
