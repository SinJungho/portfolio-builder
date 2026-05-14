import { ArrowRight, Github } from "lucide-react";
import Reveal from "../common/Reveal";
import CTAButton from "../common/CTAButton";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-spotify-near-black py-32 sm:py-48 px-6 text-center">
      {/* Spotify Green Glow */}
      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-[radial-gradient(circle,rgba(30,215,96,0.12)_0%,transparent_70%)]
          blur-[100px]
        "
      />

      <Reveal>
        <div className="relative max-w-4xl mx-auto">
          {/* title */}
          <h2 className="text-[clamp(44px,7vw,88px)] font-black text-white tracking-tight leading-[1.05] mb-8">
            지금 시작하면
            <br />
            <span className="text-spotify-green">오늘 완성</span>돼요
          </h2>

          {/* description */}
          <p className="text-[18px] sm:text-[22px] text-spotify-silver font-medium leading-relaxed mb-14 max-w-2xl mx-auto">
            수백 명의 개발자가 PortfolioForge와 함께 <br className="hidden sm:block" />
            성공적인 커리어 여정을 시작했습니다.
          </p>

          {/* CTA button */}
          <div className="flex flex-col items-center gap-6">
            <CTAButton primary className="h-16 px-12 text-[20px] shadow-spotify">
              <Github size={24} />
              GitHub로 무료 시작하기
              <ArrowRight size={22} />
            </CTAButton>

            {/* sub text */}
            <div className="text-[14px] font-bold text-spotify-silver/60 uppercase tracking-spotify">
              신용카드 불필요 · 1분 완성 · 평생 무료
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
