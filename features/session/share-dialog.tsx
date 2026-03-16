"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  LockIcon,
  ViewIcon,
  PencilEdit02Icon,
  Copy01Icon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Privacy = "private" | "view" | "edit";

const OPTIONS: { value: Privacy; icon: typeof LockIcon; label: string; desc: string }[] = [
  {
    value: "private",
    icon: LockIcon,
    label: "Private",
    desc: "Only people you invite can access",
  },
  {
    value: "view",
    icon: ViewIcon,
    label: "Anyone with link can view",
    desc: "Others can see the code but not edit",
  },
  {
    value: "edit",
    icon: PencilEdit02Icon,
    label: "Anyone with link can edit",
    desc: "Others can view and edit the code",
  },
];

export function ShareDialog({
  open,
  onOpenChange,
  sessionId,
  privacy,
  onPrivacyChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  privacy: Privacy;
  onPrivacyChange: (privacy: Privacy) => void;
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    globalThis.window !== undefined
      ? `${globalThis.location.origin}/sessions/${sessionId}`
      : `/sessions/${sessionId}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="dark bg-[#111827]! border-white/10! text-[#F9FAFB]!">
        <DialogHeader>
          <DialogTitle className="text-lg text-[#F9FAFB]">
            Share session
          </DialogTitle>
          <DialogDescription className="text-[#9CA3AF]">
            Control who can access this session.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPrivacyChange(opt.value)}
              className={cn(
                "flex items-start gap-3 rounded-lg px-3 py-3 text-left transition-colors",
                privacy === opt.value
                  ? "bg-white/10"
                  : "hover:bg-white/5",
              )}
            >
              <HugeiconsIcon
                icon={opt.icon}
                size={18}
                strokeWidth={2}
                className={cn(
                  "mt-0.5 shrink-0",
                  privacy === opt.value ? "text-[#ff3c00]" : "text-[#9CA3AF]",
                )}
              />
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    privacy === opt.value ? "text-[#F9FAFB]" : "text-[#9CA3AF]",
                  )}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-[#6B7280]">{opt.desc}</p>
              </div>
              {privacy === opt.value && (
                <HugeiconsIcon
                  icon={Tick02Icon}
                  size={16}
                  strokeWidth={2}
                  className="mt-0.5 shrink-0 text-[#ff3c00]"
                />
              )}
            </button>
          ))}
        </div>

        {privacy !== "private" && (
          <div className="flex items-center gap-2 rounded-lg bg-white/5 p-2">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 truncate bg-transparent px-2 text-xs text-[#9CA3AF] outline-none"
            />
            <button
              onClick={handleCopy}
              className="flex shrink-0 items-center gap-1.5 rounded-md bg-[#ff3c00] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#e63600]"
            >
              <HugeiconsIcon
                icon={copied ? Tick02Icon : Copy01Icon}
                size={14}
                strokeWidth={2}
              />
              {copied ? "Copied!" : "Copy link"}
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
