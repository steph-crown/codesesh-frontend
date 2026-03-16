"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Contributor } from "@/lib/sessions";
import { getColorForUser } from "@/lib/colors";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function PingMenu({
  contributors,
  onPing,
}: {
  contributors: Contributor[];
  onPing: (username: string | "everyone") => void;
}) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors">
        <HugeiconsIcon icon={Notification03Icon} size={14} strokeWidth={2} />
        Ping
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-52 rounded-lg! border-white/10! bg-[#111827]! p-1.5 gap-0"
      >
        <button
          onClick={() => onPing("everyone")}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#F9FAFB] hover:bg-white/5 transition-colors"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ff3c00]/20 text-[#ff3c00] text-[10px] font-bold">
            @
          </span>
          Ping everyone
        </button>
        <div className="my-1 h-px bg-white/10" />
        {contributors.map((c) => {
          const color = getColorForUser(c.username);
          return (
            <button
              key={c.username}
              onClick={() => onPing(c.username)}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
            >
              <Avatar size="sm">
                <AvatarFallback color={color}>
                  {getInitials(c.username)}
                </AvatarFallback>
              </Avatar>
              {c.username}
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
