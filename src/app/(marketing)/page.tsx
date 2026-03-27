"use client";

import Features from "@/components/home/Features";
import FinalCTA from "@/components/home/FinalCTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import SocialProof from "@/components/home/SocialProof";
import Testimonials from "@/components/home/Testimonials";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Features />
        <Testimonials />
        <FinalCTA />
      </main>
    </div>
  );
}
