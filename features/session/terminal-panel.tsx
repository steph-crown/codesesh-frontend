"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { Delete02Icon } from "@hugeicons/core-free-icons";

export type TerminalLine = {
  type: "stdout" | "stderr" | "system";
  text: string;
};

export function TerminalPanel({
  lines,
  running = false,
  onClear,
  className,
}: {
  lines: TerminalLine[];
  running?: boolean;
  onClear?: () => void;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines.length]);

  return (
    <div
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-lg bg-[#0D1117]",
        className,
      )}
    >
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-white/5 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-[#9CA3AF]">
            Terminal
          </span>
          {running && (
            <span className="flex items-center gap-1 text-[10px] text-[#ff3c00]">
              <span className="inline-block size-1.5 animate-pulse rounded-full bg-[#ff3c00]" />
              Running...
            </span>
          )}
        </div>
        {lines.length > 0 && onClear && (
          <button
            onClick={onClear}
            className="rounded p-0.5 text-[#6B7280] transition-colors hover:bg-white/5 hover:text-[#9CA3AF]"
            title="Clear terminal"
          >
            <HugeiconsIcon icon={Delete02Icon} size={12} strokeWidth={2} />
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed"
      >
        {lines.length === 0 ? (
          <span className="text-[#4B5563]">
            Press Run to execute your code...
          </span>
        ) : (
          lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                line.type === "stderr" && "text-[#DC2626]",
                line.type === "stdout" && "text-[#D1D5DB]",
                line.type === "system" && "text-[#6B7280]",
                line.text === "" && "h-3",
              )}
            >
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
