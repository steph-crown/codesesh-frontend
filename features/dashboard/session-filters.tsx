"use client";

import { cn } from "@/lib/utils";

export type FilterValue = "all" | "owned" | "joined";

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Created by me", value: "owned" },
  { label: "Shared with me", value: "joined" },
];

export function SessionFilters({
  value,
  onChange,
}: Readonly<{
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}>) {
  return (
    <div className="flex gap-1">
      {FILTERS.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={cn(
            "px-3 py-1.5 text-sm font-medium rounded-full transition-colors",
            value === f.value
              ? "text-primary bg-primary/10"
              : "text-[#6B7280] hover:text-[#0A0A0A] hover:bg-white",
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
