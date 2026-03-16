"use client";

import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MoreVerticalIcon,
  PencilEdit01Icon,
  PlayCircle02Icon,
  Delete01Icon,
} from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
} from "@/components/ui/avatar";
import type { Session } from "@/lib/sessions";
import { timeAgo } from "@/lib/time";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function SessionCard({
  session,
  onRename,
  onDelete,
}: Readonly<{
  session: Session;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}>) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Link
      href={`/sessions/${session.id}`}
      className="group relative block rounded-[1rem] bg-white border border-[#DFDDD7] p-8 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-[#0A0A0A] truncate">
            {session.title}
          </h3>
          <p className="mt-1 text-xs text-[#9CA3AF]">
            {session.isOwner ? "Created by you" : "Joined session"}
          </p>
        </div>

        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 -m-1.5 rounded-lg hover:bg-[#FAF5F0] transition-opacity"
          >
            <HugeiconsIcon icon={MoreVerticalIcon} size={18} strokeWidth={2} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-48 p-1.5 gap-0"
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
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#0A0A0A] hover:bg-[#FAF5F0] transition-colors"
            >
              <HugeiconsIcon icon={PencilEdit01Icon} size={16} strokeWidth={2} />
              Rename
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[#0A0A0A] hover:bg-[#FAF5F0] transition-colors"
            >
              <HugeiconsIcon icon={PlayCircle02Icon} size={16} strokeWidth={2} />
              Resume session
            </button>
            <div className="my-1 h-px bg-[#E5E0DA]" />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMenuOpen(false);
                onDelete(session.id);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
            >
              <HugeiconsIcon icon={Delete01Icon} size={16} strokeWidth={2} />
              Delete
            </button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <AvatarGroup>
          {session.contributors.slice(0, 4).map((c) => (
            <Avatar key={c.username} size="sm">
              <AvatarFallback>{getInitials(c.username)}</AvatarFallback>
            </Avatar>
          ))}
        </AvatarGroup>
        <p className="text-xs text-[#9CA3AF]">{timeAgo(session.updatedAt)}</p>
      </div>
    </Link>
  );
}
