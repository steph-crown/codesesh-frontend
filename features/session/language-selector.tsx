"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { LANGUAGES, type Language } from "@/lib/code-run-languages";

export { LANGUAGES, type Language };

export function LanguageSelector({
  value,
  onChange,
  className,
  disabled = false,
}: {
  value: string;
  onChange: (languageId: string) => void;
  className?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const current = LANGUAGES.find((l) => l.id === value) ?? LANGUAGES[0];

  const COL_SIZE = Math.ceil(LANGUAGES.length / 3);
  const col1 = LANGUAGES.slice(0, COL_SIZE);
  const col2 = LANGUAGES.slice(COL_SIZE, COL_SIZE * 2);
  const col3 = LANGUAGES.slice(COL_SIZE * 2);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-[#9CA3AF] transition-colors",
          disabled ? "cursor-default opacity-60" : "hover:bg-white/5 hover:text-[#F9FAFB]",
        )}
      >
        {current.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={cn("transition-transform", open && "rotate-180")}
        >
          <path
            d="M3 4.5L6 7.5L9 4.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-[80] bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div
            className={cn(
              "z-[90] grid max-h-[min(85vh,28rem)] w-[min(calc(100vw-2rem),22rem)] grid-cols-3 gap-x-1 overflow-y-auto rounded-lg border border-white/10 bg-[#111827] p-1.5 shadow-lg",
              "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "md:absolute md:top-full md:left-0 md:mt-1 md:max-h-none md:w-max md:translate-x-0 md:translate-y-0",
            )}
          >
          {[col1, col2, col3].map((col, ci) => (
            <div key={ci} className="flex flex-col">
              {col.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => {
                    onChange(lang.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                    lang.id === value
                      ? "bg-white/10 text-[#F9FAFB]"
                      : "text-[#9CA3AF] hover:bg-white/5 hover:text-[#F9FAFB]",
                  )}
                >
                  {lang.id === value && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M1.5 5.5L3.5 7.5L8.5 2.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {lang.label}
                </button>
              ))}
            </div>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
