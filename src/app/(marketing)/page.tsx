"use client";

import { Features } from "@/components/features/marketing/Features";
import { FinalCTA } from "@/components/features/marketing/FinalCTA";
import { Hero } from "@/components/features/marketing/Hero";
import { HowItWorks } from "@/components/features/marketing/HowItWorks";
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
