"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { THEMES, readableTextOn } from "@/preview/themes";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { Sparkles } from "lucide-react";
import React, { useState } from "react";

const isHexColor = (value: string) => /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value);

export default function ColorCustomizer() {
  const { theme, designTokens, setDesignTokens } = usePortfolioStore();

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  const currentTheme = THEMES[theme] || THEMES.minimal;
  const primaryColor =
    (designTokens?.primaryColor as string) || currentTheme?.accent || "#1ed760";
  const [draftValue, setDraftValue] = useState<string | null>(null);
  const inputValue = draftValue ?? primaryColor;
  const [error, setError] = useState("");

  const commitColor = (value: string) => {
    if (!isHexColor(value)) return setError("#RGB 또는 #RRGGBB 형식의 색상을 입력하세요.");
    setError("");
    updateToken("primaryColor", value);
    setDraftValue(null);
  };

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
          포트폴리오 강조색
        </h3>
      </header>

      <article className="bg-spotify-dark-surface p-8 rounded-2xl shadow-spotify-md border border-white/5 space-y-8">
          <div className="flex items-center gap-6">
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
              버튼과 링크에 쓰이는 색
            </Label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Input
                  id="primaryColor"
                  type="text"
                  value={inputValue}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => setDraftValue(event.target.value)}
                  onBlur={() => commitColor(inputValue)}
                  onKeyDown={(event) => event.key === "Enter" && commitColor(inputValue)}
                  aria-invalid={Boolean(error)}
                  className="h-12 border-none bg-spotify-near-black rounded-full font-mono text-[14px] font-bold text-white pl-12 pr-4 focus-visible:ring-1 focus-visible:ring-spotify-green shadow-inner"
                  aria-describedby={error ? "primary-color-error" : undefined}
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="relative">
                    <input
                      type="color"
                      aria-label="포인트 컬러 선택"
                      className="w-7 h-7 rounded-full border-none p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10"
                      value={primaryColor}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        commitColor(event.target.value)
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
            {error && <p id="primary-color-error" role="alert" className="text-[12px] font-medium text-spotify-negative">{error}</p>}
          </div>
        </div>

        <aside
          className="bg-spotify-near-black p-5 rounded-xl border border-white/5"
          role="note"
        >
          <p className="text-[13px] text-spotify-silver font-medium leading-relaxed">
            아래 미리보기처럼 채용 담당자가 먼저 보는 버튼과 링크를 강조해요. 직접 고른 색이 너무 옅으면 가독성을 위해 포커스 색상은 테마 기본색으로 보정됩니다.
          </p>
        </aside>
        <div className="rounded-xl border border-white/5 bg-spotify-near-black p-5" aria-label="강조색 미리보기">
          <p className="mb-3 text-[11px] font-bold text-spotify-silver">포트폴리오에서 이렇게 보여요</p>
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-[14px] font-bold text-white">대표 프로젝트</p>
              <p className="text-[12px] text-spotify-silver">최근 작업과 기술을 한눈에 보여줘요.</p>
            </div>
            <button
              type="button"
              className="shrink-0 rounded-full px-4 py-2 text-[12px] font-bold"
              style={{ backgroundColor: primaryColor, color: readableTextOn(primaryColor) }}
              aria-label="강조색 미리보기 버튼"
            >
              자세히 보기
            </button>
          </div>
        </div>
      </article>
    </section>
  );
}
