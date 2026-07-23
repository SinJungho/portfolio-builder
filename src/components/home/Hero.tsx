"use client";

import MockPortfolio from "@/components/common/MockPortfolio";
import { ArrowDown, ArrowRight, Github, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import CTAButton from "../common/CTAButton";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-spotify-near-black pb-20 pt-28 sm:pb-28 sm:pt-40">
      {/* A restrained light source marks the conversion from GitHub activity to a public site. */}
      <div
        className="
          pointer-events-none absolute right-[-18rem] top-16 h-[32rem] w-[32rem]
          rounded-full bg-[radial-gradient(circle,rgba(30,215,96,0.12)_0%,transparent_68%)] blur-3xl
        "
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
        <div className="text-center lg:text-left">
          <div
          className={`
            transition-all duration-700 ease-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-spotify-green/20 bg-spotify-green/10 px-3.5 py-1.5 text-[12px] font-bold text-spotify-green tracking-[0.08em]">
            <Sparkles size={14} aria-hidden="true" />
            GITHUB TO PORTFOLIO
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`
            mb-7 font-black leading-[1.02]
            tracking-tight text-white
            text-[clamp(46px,6.2vw,82px)]
            transition-all duration-1000 delay-100
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          작업의 흔적을 <br />
          <span className="text-spotify-green">보여줄 이야기</span>로
        </h1>

        {/* Description */}
        <p
          className={`
            mx-auto mb-9 max-w-xl text-[17px] font-medium leading-relaxed text-spotify-silver sm:text-[19px] lg:mx-0
            transition-all duration-1000 delay-200
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          GitHub의 프로젝트·기술·기여도를 읽어, 채용 담당자가 빠르게 이해할 수 있는 포트폴리오로 구성합니다.
        </p>

        {/* CTA */}
        <div
          className={`
            flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center lg:justify-start
            transition-all duration-1000 delay-300
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <CTAButton href="/login" primary className="h-14 w-full px-7 text-[16px] sm:w-auto">
            <Github size={20} />
            GitHub로 시작하기
            <ArrowRight size={18} />
          </CTAButton>

          <CTAButton href="#portfolio-preview" className="h-14 w-full px-7 text-[16px] sm:w-auto">
            결과 미리 보기
            <ArrowDown size={17} />
          </CTAButton>
        </div>

        <p
          className={`
            mt-6 text-[13px] font-medium text-spotify-silver/70
            transition-opacity duration-1000 delay-500
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
        >
          연결 후 프로젝트를 고르고, 문구와 디자인을 직접 조정할 수 있어요.
        </p>
        </div>

        <div
          id="portfolio-preview"
          className={`
            relative scroll-mt-24
            transition-all duration-1000 delay-400
            ${mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"}
          `}
        >
          <div className="mb-4 flex items-center justify-between px-1 text-[11px] font-bold tracking-[0.12em] text-spotify-silver/70">
            <span>LIVE PORTFOLIO PREVIEW</span>
            <span className="text-spotify-green">PUBLISHED</span>
          </div>
          <MockPortfolio />
        </div>
      </div>
    </section>
  );
}
