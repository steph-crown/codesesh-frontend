"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
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
    <>
      <div className="relative w-full md:hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as FilterValue)}
          aria-label="Filter sessions"
          className={cn(
            "h-11 w-full cursor-pointer appearance-none rounded-full border border-[#DFDDD7] bg-white pl-4 pr-11 text-sm font-medium text-[#0A0A0A] outline-none transition-shadow",
            "focus:border-primary focus:ring-2 focus:ring-primary/40",
          )}
        >
          {FILTERS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          size={18}
          strokeWidth={2}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]"
          aria-hidden
        />
      </div>

      <div className="hidden gap-1 md:flex">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => onChange(f.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              value === f.value
                ? "bg-primary/10 text-primary"
                : "text-[#6B7280] hover:bg-white hover:text-[#0A0A0A]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </>
  );
}
