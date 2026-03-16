import { Navbar } from "@/features/landing/navbar"
import { HeroSection } from "@/features/landing/hero-section"
import { LiveDemo } from "@/features/landing/live-demo"
import { FeaturesSection } from "@/features/landing/features-section"
import { HowItWorks } from "@/features/landing/how-it-works"
import { Footer } from "@/features/landing/footer"

export default function Home() {
  return (
    <main className="overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <LiveDemo />
      <FeaturesSection />
      <HowItWorks />
      <Footer />
    </main>
  )
}
