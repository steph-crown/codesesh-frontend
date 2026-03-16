"use client";

import { cn } from "@/lib/utils";

export type TerminalLine = {
  type: "stdout" | "stderr" | "system";
  text: string;
};

const MOCK_OUTPUT: TerminalLine[] = [
  { type: "system", text: "$ Running TypeScript..." },
  { type: "stdout", text: "Compiling..." },
  { type: "stdout", text: "✓ Compiled successfully in 0.42s" },
  { type: "stdout", text: "" },
  { type: "stdout", text: "Test 1: twoSum([2,7,11,15], 9)" },
  { type: "stdout", text: "  → [0, 1] ✓" },
  { type: "stdout", text: "" },
  { type: "stdout", text: "Test 2: twoSum([3,2,4], 6)" },
  { type: "stdout", text: "  → [1, 2] ✓" },
  { type: "stdout", text: "" },
  { type: "system", text: "All tests passed." },
];

export function TerminalPanel({
  lines = MOCK_OUTPUT,
  className,
}: {
  lines?: TerminalLine[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-lg bg-[#0D1117]",
        className,
      )}
    >
      <div className="flex h-8 shrink-0 items-center gap-2 border-b border-white/5 px-3">
        <span className="text-[11px] font-medium text-[#9CA3AF]">Terminal</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 font-mono text-xs leading-relaxed">
        {lines.map((line, i) => (
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
        ))}
      </div>
    </div>
  );
}
