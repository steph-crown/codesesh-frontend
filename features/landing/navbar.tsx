"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon, Menu01Icon } from "@hugeicons/core-free-icons";
import { useLandingHeroActions } from "./landing-hero-actions-context";

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { createSession, openJoinDialog } = useLandingHeroActions();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[72px] px-5 md:px-12 bg-[#FBF6F2]/80 backdrop-blur-md">
      <Link href="/">
        <Image
          src="/logo-with-text.svg"
          alt="CodeSesh"
          width={129}
          height={40}
          priority
        />
      </Link>
      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/my-sessions"
          className="hidden sm:block text-sm font-medium text-[#0A0A0A] hover:text-primary transition-colors"
        >
          My Sessions
        </Link>
        <a
          href="https://github.com/steph-crown/codesesh-api"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2 shrink-0",
          )}
        >
          <HugeiconsIcon icon={GithubIcon} className="size-4" />
          <span className="hidden sm:inline">Star on GitHub</span>
        </a>
        <Popover open={menuOpen} onOpenChange={setMenuOpen}>
          <PopoverTrigger
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "sm:hidden size-9 shrink-0 p-0",
            )}
            aria-label="Open menu"
          >
            <HugeiconsIcon icon={Menu01Icon} className="size-4" />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="bottom"
            sideOffset={8}
            className="w-52 gap-0 rounded-xl border border-[#DFDDD7] bg-white p-1.5 shadow-lg ring-0"
          >
            <nav className="flex flex-col gap-0.5">
              <Link
                href="/my-sessions"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F3F0EA]"
                onClick={() => setMenuOpen(false)}
              >
                My Sessions
              </Link>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F3F0EA]"
                onClick={() => {
                  createSession();
                  setMenuOpen(false);
                }}
              >
                Create Session
              </button>
              <button
                type="button"
                className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#0A0A0A] transition-colors hover:bg-[#F3F0EA]"
                onClick={() => {
                  openJoinDialog();
                  setMenuOpen(false);
                }}
              >
                Join Session
              </button>
            </nav>
          </PopoverContent>
        </Popover>
      </div>
    </nav>
  );
}
