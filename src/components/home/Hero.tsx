"use client";

import MockPortfolio from "@/components/common/MockPortfolio";
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

      <div className="relative mx-auto grid max-w-[90rem] items-center gap-14 px-6 lg:grid-cols-[minmax(29rem,0.88fr)_minmax(0,1.12fr)] lg:gap-14 xl:gap-20">
        <div className="min-w-0 text-center lg:text-left">
          <div
          className={`
            transition-all duration-700 ease-out
            motion-reduce:transition-none motion-reduce:!translate-y-0 motion-reduce:!opacity-100
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
          `}
        >
          <div className="mb-8 inline-flex items-baseline gap-2 text-[15px] font-medium tracking-[-0.02em] text-spotify-silver">
            <span aria-hidden="true" className="font-mono text-[13px] font-semibold text-spotify-green">
              {"/*"}
            </span>
            <span>
              GitHub의 <strong className="font-semibold text-spotify-near-white">작업 기록</strong>을 포트폴리오로
            </span>
            <span aria-hidden="true" className="font-mono text-[13px] font-semibold text-spotify-green">
              {"*/"}
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1
          className={`
            mb-7 font-black leading-[1.02]
            tracking-tight text-white
            text-[clamp(46px,4.5vw,76px)] lg:whitespace-nowrap
            transition-all duration-1000 delay-100
            motion-reduce:transition-none motion-reduce:!translate-y-0 motion-reduce:!opacity-100
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
            motion-reduce:transition-none motion-reduce:!translate-y-0 motion-reduce:!opacity-100
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
            motion-reduce:transition-none motion-reduce:!translate-y-0 motion-reduce:!opacity-100
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
          `}
        >
          <CTAButton href="/login" primary className="h-13 w-full px-6 text-[15px] sm:h-14 sm:px-7 sm:text-[16px] sm:w-auto">
            GitHub로 시작하기
          </CTAButton>

          <CTAButton href="#portfolio-preview" className="h-13 w-full px-6 text-[15px] sm:h-14 sm:px-7 sm:text-[16px] sm:w-auto">
            결과 미리 보기
          </CTAButton>
        </div>

        <p
          className={`
            mt-6 text-[13px] font-medium text-spotify-silver/70
            transition-opacity duration-1000 delay-500
            motion-reduce:transition-none motion-reduce:!opacity-100
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
        >
          연결 후 프로젝트를 고르고, 문구와 디자인을 직접 조정할 수 있어요.
        </p>
        </div>

        <div
          id="portfolio-preview"
          className={`
            relative min-w-0 scroll-mt-24
            transition-all duration-1000 delay-400
            motion-reduce:transition-none motion-reduce:!translate-y-0 motion-reduce:!scale-100 motion-reduce:!opacity-100
            ${mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-12"}
          `}
        >
          <div className="mb-5 flex flex-col items-start gap-2 rounded-2xl border border-white/10 bg-spotify-dark-surface px-4 py-3 text-[12px] font-bold tracking-[0.06em] text-spotify-near-white sm:flex-row sm:items-center sm:justify-between sm:text-[13px]">
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] text-spotify-silver">
                예시
              </span>
              포트폴리오 결과 미리보기
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-spotify-green/20 bg-spotify-green/10 px-2.5 py-1 text-[11px] tracking-[0.08em] text-spotify-green sm:text-[12px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-spotify-green shadow-[0_0_8px_rgba(30,215,96,0.75)]" />
              배포 완료
            </span>
          </div>
          <MockPortfolio />
        </div>
      </div>
    </section>
  );
}
