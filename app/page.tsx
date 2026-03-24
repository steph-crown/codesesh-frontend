import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/features/landing/navbar";
import { HeroSection } from "@/features/landing/hero-section";
import { LandingPageWithActions } from "@/features/landing/landing-page-with-actions";
import { LiveDemo } from "@/features/landing/live-demo";
import { FeaturesSection } from "@/features/landing/features-section";
import { HowItWorks } from "@/features/landing/how-it-works";
import { Footer } from "@/features/landing/footer";
import {
  getSiteOrigin,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site-config";

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Collaborative coding in real time` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    url: getSiteOrigin(),
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
};

export default function Home() {
  return (
    <LandingPageWithActions>
      <main className="overflow-x-hidden">
        <Navbar />
        <div className="md:min-h-svh md:flex md:flex-col">
          <Suspense fallback={null}>
            <HeroSection />
          </Suspense>
          <LiveDemo />
        </div>
        <FeaturesSection />
        <div className="mx-auto max-w-7xl border-t border-[#C7C3BB]" />
        <HowItWorks />
        <Footer />
      </main>
    </LandingPageWithActions>
  );
}
