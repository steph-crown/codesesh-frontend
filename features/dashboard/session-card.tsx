"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreVerticalIcon,
  PencilEdit01Icon,
  PlayCircle02Icon,
  Delete01Icon,
  LockIcon,
  ViewIcon,
  PencilEdit02Icon,
} from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { SessionSummary } from "@/lib/api-types";
import { timeAgo } from "@/lib/time";

const VISIBILITY_CONFIG = {
  private: { icon: LockIcon, label: "Private" },
  view_only: { icon: ViewIcon, label: "View only" },
  edit: { icon: PencilEdit02Icon, label: "Can edit" },
} as const;

export function SessionCard({
  session,
  onRename,
  onEnd,
}: Readonly<{
  session: SessionSummary;
  onRename: (id: string) => void;
  onEnd: (id: string) => void;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);
  const visConfig = VISIBILITY_CONFIG[session.visibility];

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group relative block rounded-[1rem] border border-[#ededea] bg-white p-8 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-[#0A0A0A]">
            {session.name}
          </h3>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs text-[#9CA3AF]">
              <HugeiconsIcon
                icon={visConfig.icon}
                size={12}
                strokeWidth={2}
              />
              {visConfig.label}
            </span>
            <span className="text-[#D1D5DB]">&middot;</span>
            <span className="text-xs text-[#9CA3AF]">
              {session.is_owner ? "Created by you" : "Joined session"}
            </span>
            {session.status === "ended" && (
              <>
                <span className="text-[#D1D5DB]">&middot;</span>
                <span className="text-xs font-medium text-red-400">Ended</span>
              </>
            )}
          </div>
        </div>

        {session.is_owner && session.status === "active" && (
          <Popover open={menuOpen} onOpenChange={setMenuOpen}>
            <PopoverTrigger
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="-m-1.5 rounded-md p-1.5 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <HugeiconsIcon
                icon={MoreVerticalIcon}
                size={18}
                strokeWidth={2}
              />
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              sideOffset={4}
              className="w-48 gap-0 rounded-lg! p-1.5"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  onRename(session.id);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#0A0A0A] transition-colors hover:bg-[#FAF5F0]"
              >
                <HugeiconsIcon
                  icon={PencilEdit01Icon}
                  size={16}
                  strokeWidth={2}
                />
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#0A0A0A] transition-colors hover:bg-[#FAF5F0]"
              >
                <HugeiconsIcon
                  icon={PlayCircle02Icon}
                  size={16}
                  strokeWidth={2}
                />
                Open session
              </button>
              <div className="my-1 h-px bg-[#E5E0DA]" />
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEnd(session.id);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 transition-colors hover:bg-red-50"
              >
                <HugeiconsIcon
                  icon={Delete01Icon}
                  size={16}
                  strokeWidth={2}
                />
                End session
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="rounded-full bg-[#FAF5F0] px-2.5 py-0.5 text-[10px] font-medium text-[#9CA3AF]">
          {session.language}
        </span>
        <p className="text-xs text-[#9CA3AF]">
          {timeAgo(session.last_activity_at)}
        </p>
      </div>
    </Link>
  );
}
