import { Navbar } from "@/features/landing/navbar";
import { HeroSection } from "@/features/landing/hero-section";
import { LiveDemo } from "@/features/landing/live-demo";
import { FeaturesSection } from "@/features/landing/features-section";
import { HowItWorks } from "@/features/landing/how-it-works";
import { Footer } from "@/features/landing/footer";

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <div className="min-h-svh flex flex-col">
        <HeroSection />
        <LiveDemo />
      </div>
      <FeaturesSection />
      <div className="border-t border-[#C7C3BB] max-w-7xl mx-auto"></div>
      <HowItWorks />
      <Footer />
    </main>
  );
}
