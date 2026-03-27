"use client";

import MockPortfolio from "@/components/common/MockPortfolio";
import { TOSS_BLUE } from "@/lib/validations/color";
import { ArrowRight, Github } from "lucide-react";
import { useEffect, useState } from "react";
import CTAButton from "../common/CTAButton";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] pt-40 pb-30 text-center">
      {/* subtle grid background */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]
          bg-size-[40px_40px]
          [radial-gradient(ellipse_80%_60%_at_50%_40%,black_30%,transparent_100%)]
        "
      />

      {/* blue glow */}
      <div
        className="
          pointer-events-none absolute left-1/2 -top-50
          h-200 w-200 -translate-x-1/2 rounded-full
          bg-[radial-gradient(circle,rgba(49,130,246,0.12)_0%,transparent_70%)]
        "
      />

      <div className="relative mx-auto max-w-800 px-6">
        {/* Badge */}
        <div
          className={`
            transition-all duration-600 ease-in-out
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}
          `}
          style={{ transitionDelay: "100ms" }}
        >
          <span
            className="
              mb-8 inline-flex items-center gap-1.5
              rounded-full border px-1.5 py-1.5
              text-[13px] font-semibold
              bg-[rgba(49,130,246,0.08)]
              border-[rgba(49,130,246,0.2)]
            "
            style={{ color: TOSS_BLUE }}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: TOSS_BLUE }}
            />
            AI 기반 포트폴리오 빌더
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`
            mb-6 font-extrabold leading-[1.1]
            tracking-[-2px] text-[#191F28]
            text-[clamp(48px,7vw,80px)]
            transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7.5"}
          `}
          style={{ transitionDelay: "200ms" }}
        >
          GitHub를
          <br />
          <span style={{ color: TOSS_BLUE }}>포트폴리오</span>로
        </h1>

        {/* Description */}
        <p
          className={`
            mx-auto mb-12 max-w-130
            text-[20px] leading-[1.7] text-gray-500
            transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7.5"}
          `}
          style={{ transitionDelay: "350ms" }}
        >
          GitHub 계정 하나만 연결하면
          <br />
          AI가 자동으로 인상적인 포트폴리오를 만들어드려요.
        </p>

        {/* CTA */}
        <div
          className={`
            flex flex-col md:flex-row items-center justify-center gap-3
            transition-all duration-700
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-7.5"}
          `}
          style={{ transitionDelay: "500ms" }}
        >
          <CTAButton primary>
            <Github size={18} />
            GitHub로 시작하기
            <ArrowRight size={16} />
          </CTAButton>

          <CTAButton>데모 보기</CTAButton>
        </div>

        <p
          className={`
            mt-5 text-[13px] text-gray-400
            transition-opacity duration-700
            ${mounted ? "opacity-100" : "opacity-0"}
          `}
          style={{ transitionDelay: "700ms" }}
        >
          신용카드 없이 · 평생 완전 무료 · 1분이면 완성
        </p>

        {/* Mock UI */}
        <div
          className={`
            relative mt-20
            transition-all duration-900
            ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}
          `}
          style={{ transitionDelay: "600ms" }}
        >
          <MockPortfolio />
        </div>
      </div>
    </section>
  );
}
