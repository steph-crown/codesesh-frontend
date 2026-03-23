"use client";

import { useCallback, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Participant } from "@/lib/api-types";
import { getColorByName } from "@/lib/colors";
import { formatTimeAgo, parseParticipantDate } from "@/lib/relative-time";
import { cn } from "@/lib/utils";

const HOVER_LEAVE_MS = 200;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function ParticipantAvatarHover({
  participant,
  hostId,
  currentUserId,
  className,
}: {
  participant: Participant;
  hostId: string;
  /** When set, shows "(Me)" after the name for this participant. */
  currentUserId?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const cancelLeave = useCallback(() => {
    if (leaveTimer.current !== undefined) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = undefined;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    cancelLeave();
    leaveTimer.current = setTimeout(() => setOpen(false), HOVER_LEAVE_MS);
  }, [cancelLeave]);

  const onEnter = useCallback(() => {
    cancelLeave();
    setOpen(true);
  }, [cancelLeave]);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!next) cancelLeave();
      setOpen(next);
    },
    [cancelLeave],
  );

  const isCreator =
    hostId.length > 0 && participant.user_id === hostId;
  const isMe =
    !!currentUserId &&
    currentUserId.length > 0 &&
    participant.user_id === currentUserId;
  const joined = formatTimeAgo(parseParticipantDate(participant.joined_at));

  return (
    <Popover open={open} onOpenChange={onOpenChange} modal={false}>
      <PopoverTrigger
        type="button"
        className={cn(
          "rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
          className,
        )}
        onMouseEnter={onEnter}
        onMouseLeave={scheduleClose}
      >
        <Avatar size="sm">
          <AvatarFallback color={getColorByName(participant.color)}>
            {getInitials(participant.display_name)}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={6}
        className="w-56 gap-1 rounded-xl! border-white/10! bg-[#111827]! p-3 text-xs shadow-xl"
        onMouseEnter={onEnter}
        onMouseLeave={scheduleClose}
      >
        <p className="font-medium text-[#F9FAFB]">
          {participant.display_name}
          {isMe ? (
            <span className="font-normal text-[#9CA3AF]"> (Me)</span>
          ) : null}
        </p>
        <p className="text-[#9CA3AF]">
          {isCreator ? "Creator" : "Joiner"}
        </p>
        <p className="text-[10px] text-[#6B7280]">Joined {joined}</p>
      </PopoverContent>
    </Popover>
  );
}
