import { TOSS_BLUE } from "@/lib/validations/color";
import { ArrowRight, Github } from "lucide-react";
import Reveal from "../common/Reveal";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-[#191F28] py-30 px-6 text-center">
      {/* radial background */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 w-200 h-200 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(49,130,246,0.15) 0%, transparent 70%)",
        }}
      />

      <Reveal>
        <div className="relative max-w-150 mx-auto">
          {/* title */}
          <h2 className="text-[clamp(40px,6vw,72px)] font-extrabold text-white tracking-[-2px] leading-[1.1] mb-6">
            지금 시작하면
            <br />
            <span style={{ color: TOSS_BLUE }}>오늘 완성</span>돼요
          </h2>

          {/* description */}
<<<<<<< HEAD
          <p className="text-[18px] text-gray-200 leading-[1.7] mb-12">
=======
          <p className="text-[18px] text-gray-400 leading-[1.7] mb-12">
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
            수백 명의 개발자가 포트폴리오포지로
            <br />
            꿈의 회사에 합격했어요.
          </p>

          {/* CTA button */}
          <button
<<<<<<< HEAD
            className="inline-flex items-center gap-2.5 px-9 py-3 md:py-4 rounded-full text-[18px] md:text-lg lg:text-xl font-bold text-white transition-all"
=======
            className="inline-flex items-center gap-2.5 px-9 py-4 rounded-full text-[18px] font-bold text-white transition-all"
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
            style={{
              background: TOSS_BLUE,
              boxShadow: "0 8px 32px rgba(49,130,246,0.4)",
            }}
          >
            <Github size={20} />
            GitHub로 무료 시작하기
            <ArrowRight size={18} />
          </button>

          {/* sub text */}
<<<<<<< HEAD
          <div className="mt-5 text-sm text-gray-300">
=======
          <div className="mt-5 text-sm text-gray-500">
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
            신용카드 불필요 · 1분이면 완성 · 언제든 취소 가능
          </div>
        </div>
      </Reveal>
    </section>
  );
}
