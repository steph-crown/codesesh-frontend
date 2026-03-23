"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Notification03Icon } from "@hugeicons/core-free-icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getColorByName } from "@/lib/colors";

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
  onPingEveryone,
  onPingUser,
}: {
  contributors: { user_id: string; display_name: string; color: string }[];
  onPingEveryone: () => void;
  onPingUser: (userId: string) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-[#F9FAFB]">
        <HugeiconsIcon icon={Notification03Icon} size={14} strokeWidth={2} />
        Ping
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={8}
        className="w-52 gap-0 rounded-lg! border-white/10! bg-[#111827]! p-1.5"
      >
        <button
          type="button"
          onClick={onPingEveryone}
          className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#F9FAFB] transition-colors hover:bg-white/5"
        >
          <span className="flex size-6 items-center justify-center rounded-full bg-[#ff3c00]/20 text-[10px] font-bold text-[#ff3c00]">
            @
          </span>
          Ping everyone
        </button>
        {contributors.length > 0 ? (
          <div className="my-1 h-px bg-white/10" />
        ) : null}
        {contributors.map((c) => (
          <button
            type="button"
            key={c.user_id}
            onClick={() => onPingUser(c.user_id)}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-[#9CA3AF] transition-colors hover:bg-white/5 hover:text-[#F9FAFB]"
          >
            <Avatar size="sm">
              <AvatarFallback color={getColorByName(c.color)}>
                {getInitials(c.display_name)}
              </AvatarFallback>
            </Avatar>
            {c.display_name}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
