"use client";

import { usePortfolioStore } from "@/stores/portfolioStore";
import { Code } from "lucide-react";

export default function CustomCssEditor() {
  const { designTokens, setDesignTokens } = usePortfolioStore();

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  return (
    <section className="space-y-6 pt-10 border-t border-white/5">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-white/5 rounded-full">
          <Code className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-[20px] font-bold text-white tracking-tight">
            고급 CSS 편집
          </h3>
          <p className="text-[12px] text-spotify-silver font-bold tracking-spotify">
            직접 스타일 작성
          </p>
        </div>
      </div>

      <div className="bg-[#1e1e1e] p-8 rounded-[32px] shadow-spotify space-y-5 border border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.3)]" />
              <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.3)]" />
            </div>
            <span className="ml-3 text-[12px] font-mono text-spotify-silver tracking-spotify-wide opacity-50">
              사용자 정의 스타일 (CSS)
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={(designTokens?.customCss as string) || ""}
            onChange={(e) => updateToken("customCss", e.target.value)}
            placeholder="/* 이곳에 사용자 정의 CSS를 작성하세요. */&#10;.portfolio-header { background: linear-gradient(...) }"
            className="w-full h-56 bg-transparent text-[#d4d4d4] font-mono text-[14px] leading-relaxed resize-none focus:outline-none placeholder:text-gray-700 custom-scrollbar"
            spellCheck={false}
          />
        </div>

        <div className="pt-5 border-t border-white/5 flex items-center justify-between">
          <p className="text-[11px] text-spotify-silver font-medium">
            <span className="text-spotify-green mr-1.5">TIP:</span>
            CSS 셀렉터로 테마를 정밀하게 튜닝할 수 있습니다.
          </p>
          <span className="text-[10px] text-white/20 font-mono italic">
            v2.0 Immersive
          </span>
        </div>
      </div>
    </section>
  );
}
