"use client";

import Features from "@/components/home/Features";
import FinalCTA from "@/components/home/FinalCTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import SocialProof from "@/components/home/SocialProof";
// Testimonials: 실제 후기가 아직 없어 섹션을 잠시 내렸다. 진짜 후기가 쌓이면
// import 후 <SocialProof /> 아래 다시 배치하면 된다. (컴포넌트는 그대로 유지)

export default function Page() {
  return (
    <div className="min-h-screen bg-spotify-near-black">
      <main>
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Features />
        <FinalCTA />
      </main>
    </div>
  );
}
