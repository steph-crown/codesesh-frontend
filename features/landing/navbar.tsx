"use client";

import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { GithubIcon } from "@hugeicons/core-free-icons";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-[72px] px-6 md:px-12 bg-[#FBF6F2]/80 backdrop-blur-md">
      <Link href="/">
        <Image
          src="/logo-with-text.svg"
          alt="CodeSesh"
          width={129}
          height={40}
          priority
        />
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/my-sessions"
          className="hidden sm:block text-sm font-medium text-[#0A0A0A] hover:text-primary transition-colors"
        >
          My Sessions
        </Link>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-2",
          )}
        >
          <HugeiconsIcon icon={GithubIcon} className="size-4" />
          <span className="hidden sm:inline">Star on GitHub</span>
        </a>
      </div>
    </nav>
  );
}
