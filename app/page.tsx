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
  getOgImageAbsoluteUrl,
  getSiteOrigin,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
} from "@/lib/site-config";

const ogImage = {
  url: getOgImageAbsoluteUrl(),
  width: OG_IMAGE_WIDTH,
  height: OG_IMAGE_HEIGHT,
  alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
  type: "image/png" as const,
};

export const metadata: Metadata = {
  title: { absolute: `${SITE_NAME} — Collaborative coding in real time` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    url: getSiteOrigin(),
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: {
      url: ogImage.url,
      width: ogImage.width,
      height: ogImage.height,
      alt: ogImage.alt,
    },
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
