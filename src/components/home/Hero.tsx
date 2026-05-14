"use client";

import MockPortfolio from "@/components/common/MockPortfolio";
import { ArrowRight, Github, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import CTAButton from "../common/CTAButton";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-spotify-near-black pt-32 pb-24 sm:pt-48 sm:pb-32 text-center">
      {/* Spotify Green Glow */}
      <div
        className="
          pointer-events-none absolute left-1/2 -top-40
          h-[600px] w-[600px] -translate-x-1/2 rounded-full
          bg-[radial-gradient(circle,rgba(30,215,96,0.08)_0%,transparent_70%)]
          blur-3xl
        "
      />

      <div className="relative mx-auto max-w-5xl px-6">
        {/* Badge */}
        <div
          className={`
            transition-all duration-700 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-[13px] font-bold text-spotify-green uppercase tracking-spotify-wide shadow-spotify-md">
            <Sparkles size={14} className="animate-pulse" />
            AI 기반 포트폴리오 빌더
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`
            mb-8 font-black leading-[1.05]
            tracking-tight text-white
            text-[clamp(44px,8vw,88px)]
            transition-all duration-1000 delay-100
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          GitHub를 <br />
          <span className="text-spotify-green">포트폴리오</span>로
        </h1>

        {/* Description */}
        <p
          className={`
            mx-auto mb-12 max-w-2xl
            text-[18px] sm:text-[20px] leading-relaxed text-spotify-silver font-medium
            transition-all duration-1000 delay-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          GitHub 계정 하나만 연결하면 <br className="hidden sm:block" />
          AI가 자동으로 인상적인 포트폴리오를 구성하고 즉시 배포합니다.
        </p>

        {/* CTA */}
        <div
          className={`
            flex flex-col sm:flex-row items-center justify-center gap-4
            transition-all duration-1000 delay-300
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <CTAButton primary className="h-14 px-10 text-[16px] w-full sm:w-auto">
            <Github size={20} />
            GitHub로 시작하기
            <ArrowRight size={18} />
          </CTAButton>

          <CTAButton className="h-14 px-10 text-[16px] w-full sm:w-auto">
            데모 보기
          </CTAButton>
        </div>

        <p
          className={`
            mt-8 text-[13px] text-spotify-silver/60 font-medium
            transition-opacity duration-1000 delay-500
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
        >
          1분 완성 · 평생 완전 무료 · 신용카드 불필요
        </p>

        {/* Mock UI */}
        <div
          className={`
            relative mt-24 sm:mt-32
            transition-all duration-1000 delay-400
            ${mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"}
          `}
        >
          <div className="absolute inset-0 bg-spotify-green/10 blur-[120px] rounded-full pointer-events-none translate-y-20" />
          <MockPortfolio />
        </div>
      </div>
    </section>
  );
}
