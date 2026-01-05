import { Features } from "@/components/Features";
import { FinalCTA } from "@/components/FinalCTA";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { SocialProof } from "@/components/SocialProof";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-[72px]">
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
