"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEMES } from "@/preview/themes";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { Sparkles } from "lucide-react";
import React from "react";

export default function ColorCustomizer() {
  const { theme, designTokens, setDesignTokens } = usePortfolioStore();

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  const currentTheme = THEMES[theme] || THEMES.minimal;
  const primaryColor =
    (designTokens?.primaryColor as string) || currentTheme?.accent || "#1ed760";

  return (
    <section className="space-y-6" aria-labelledby="color-customizer-heading">
      <header className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2.5 bg-white/5 rounded-full" aria-hidden="true">
          <Sparkles className="w-5 h-5 text-spotify-green" />
        </div>
        <h3
          id="color-customizer-heading"
          className="text-[20px] font-bold text-white tracking-tight"
        >
          포인트 컬러
        </h3>
      </header>

      <article className="bg-spotify-dark-surface p-8 rounded-2xl shadow-spotify-md border border-white/5 space-y-8">
        <div className="flex items-center gap-8">
          <div
            className="w-20 h-20 rounded-full shadow-spotify border border-white/10 shrink-0 transition-transform duration-500"
            style={{ backgroundColor: primaryColor }}
            aria-hidden="true"
          />
          <div className="flex-1 space-y-2">
            <Label
              htmlFor="primaryColor"
              className="text-[12px] font-bold text-spotify-silver tracking-spotify"
            >
              강조 색상 (Accent)
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    updateToken("primaryColor", event.target.value)
                  }
                  className="h-12 border-none bg-spotify-near-black rounded-full font-mono text-[14px] font-bold text-white pl-12 pr-4 focus-visible:ring-1 focus-visible:ring-spotify-green shadow-inner"
                  aria-label="포인트 컬러 HEX 코드 입력"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="relative">
                    <input
                      type="color"
                      aria-label="포인트 컬러 선택"
                      className="w-7 h-7 rounded-full border-none p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
                      value={primaryColor}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        updateToken("primaryColor", event.target.value)
                      }
                    />
                    <div
                      className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-transform active:scale-90"
                      style={{ backgroundColor: primaryColor }}
                      aria-hidden="true"
                    >
                      <div className="w-1 h-1 rounded-full bg-black/50" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside
          className="bg-spotify-near-black p-5 rounded-xl border border-white/5"
          role="note"
        >
          <p className="text-[13px] text-spotify-silver font-medium leading-relaxed">
            버튼, 링크, 프로필 강조 등 사이트 전체의{" "}
            <strong className="text-white">핵심 브랜드 컬러</strong>를
            변경합니다. 테마 프리셋의 기본 색상보다 우선 적용됩니다.
          </p>
        </aside>
      </article>
    </section>
  );
}
