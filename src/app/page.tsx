import { Features } from "@/components/features/marketing/Features";
import { FinalCTA } from "@/components/features/marketing/FinalCTA";
import { Hero } from "@/components/features/marketing/Hero";
import { HowItWorks } from "@/components/features/marketing/HowItWorks";
import { SocialProof } from "@/components/features/marketing/SocialProof";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-18">
        <Hero />
        <SocialProof />
        <Features />
        <HowItWorks />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
