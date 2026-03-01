"use client";

import { Features } from "@/components/features/marketing/Features";
import { FinalCTA } from "@/components/features/marketing/FinalCTA";
import { Hero } from "@/components/features/marketing/Hero";
import { HowItWorks } from "@/components/features/marketing/HowItWorks";
import Pricing from "@/components/home/Pricing";
import Testimonials from "@/components/home/Testimonials";

export default function Page() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
    </div>
  );
}
