"use client";
import Features from "@/components/home/Features";
import FinalCTA from "@/components/home/FinalCTA";
import Hero from "@/components/home/Hero";
import HowItWorks from "@/components/home/HowItWorks";
import SocialProof from "@/components/home/SocialProof";
import Testimonials from "@/components/home/Testimonials";

export default function Page() {
  return (
    <div className="min-h-screen bg-white">
      <main>
        {/* 히어로 섹션 */}
        <Hero />

        {/* 통계/신뢰도 섹션 */}
        <SocialProof />

        {/* 서비스 작동 방식 */}
        <HowItWorks />

        {/* 주요 기능 */}
        <Features />

        {/* 사용자 후기 */}
        <Testimonials />

        {/* 하단 CTA */}
        <FinalCTA />
      </main>
    </div>
  );
}
