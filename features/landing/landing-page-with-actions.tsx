"use client";

import type { ReactNode } from "react";
import { LandingHeroActionsProvider } from "./landing-hero-actions-context";

/** Wraps the marketing home page so `Navbar` and `HeroSection` share create/join actions. */
export function LandingPageWithActions({ children }: { children: ReactNode }) {
  return <LandingHeroActionsProvider>{children}</LandingHeroActionsProvider>;
}
