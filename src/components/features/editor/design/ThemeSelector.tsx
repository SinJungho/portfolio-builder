"use client";

import { THEMES, ThemeTokens } from "@/preview/themes";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

const recommendedThemeIds = ["spotify", "minimal", "midnight"];

export default function ThemeSelector() {
  const { theme, setTheme } = usePortfolioStore();
  const [showAllThemes, setShowAllThemes] = useState(
    () => !recommendedThemeIds.includes(theme),
  );
  const themes = showAllThemes
    ? Object.values(THEMES)
    : Object.values(THEMES).filter((themeItem) =>
        recommendedThemeIds.includes(themeItem.id),
      );
  const hiddenThemeCount = Object.keys(THEMES).length - recommendedThemeIds.length;
  const themeIds = themes.map((themeItem) => themeItem.id);

  const moveTheme = (currentId: string, direction: 1 | -1) => {
    const currentIndex = themeIds.indexOf(currentId);
    const nextIndex = (currentIndex + direction + themeIds.length) % themeIds.length;
    const nextId = themeIds[nextIndex];
    if (nextId) setTheme(nextId);
    requestAnimationFrame(() => document.getElementById(`theme-${nextId}`)?.focus());
  };

  return (
    <section className="space-y-6" aria-labelledby="theme-selector-heading">
      <header className="flex items-center justify-between border-b border-white/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 rounded-full" aria-hidden="true">
            <Palette className="w-5 h-5 text-spotify-green" />
          </div>
          <h3
            id="theme-selector-heading"
            className="text-[20px] font-bold text-white tracking-tight"
          >
          포트폴리오 분위기
          </h3>
        </div>
        <span className="text-[11px] font-bold text-spotify-silver bg-white/5 px-3 py-1 rounded-full">
          결과를 보고 선택해요
        </span>
      </header>

      <div
        className="grid grid-cols-1 gap-4"
        role="radiogroup"
        aria-labelledby="theme-selector-heading"
      >
        {themes.map((themeItem: ThemeTokens) => (
          <button
            key={themeItem.id}
            id={`theme-${themeItem.id}`}
            type="button"
            role="radio"
            aria-checked={theme === themeItem.id}
            tabIndex={theme === themeItem.id ? 0 : -1}
            onClick={() => setTheme(themeItem.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowRight") {
                event.preventDefault();
                moveTheme(themeItem.id, 1);
              }
              if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
                event.preventDefault();
                moveTheme(themeItem.id, -1);
              }
            }}
            className={`
              group relative flex flex-col gap-4 p-4 rounded-lg transition-all duration-200 text-left overflow-hidden border border-transparent
              ${
                theme === themeItem.id
                  ? "bg-spotify-mid-dark shadow-spotify-md border-white/10"
                  : "bg-spotify-dark-surface hover:bg-spotify-mid-dark"
              }
              active:scale-[0.98]
            `}
          >
            <div className="flex items-start justify-between gap-3 z-10 w-full">
              <div className="min-w-0">
                <span className={`block text-[15px] font-bold ${
                    theme === themeItem.id
                      ? "text-spotify-green"
                      : "text-spotify-silver group-hover:text-white"
                  }`}
                >
                  {themeItem.label}
                </span>
                <span className="mt-1 block text-[11px] font-medium leading-snug text-spotify-silver">
                  {themeItem.description}
                </span>
              </div>
              {theme === themeItem.id && (
                <div
                  className="w-5 h-5 rounded-full bg-spotify-green flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                </div>
              )}
            </div>
            <div
              className="rounded-xl border p-3 space-y-3"
              style={{ backgroundColor: themeItem.bg, color: themeItem.text, borderColor: themeItem.cardBorder }}
              aria-hidden="true"
            >
              <div className="text-[9px] font-bold  opacity-50">예시 미리보기</div>
              <div className="flex items-center justify-between gap-2 text-[10px] font-bold opacity-70">
                <span>김민준</span>
                <span>Frontend Developer</span>
              </div>
              <div className="space-y-1">
                <div className="text-[13px] font-bold">만든 일을 한눈에 보여줘요</div>
                <div className="text-[10px] opacity-70">대표 프로젝트와 기술을 빠르게 확인할 수 있어요.</div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold opacity-70">대표 프로젝트 3개</span>
                <span className="rounded-full px-2 py-1 text-[9px] font-bold" style={{ backgroundColor: themeItem.ctaBg, color: themeItem.ctaText }}>
                  자세히 보기
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="w-full rounded-full bg-white/5 px-4 py-3 text-[12px] font-bold text-spotify-silver transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
        aria-expanded={showAllThemes}
        onClick={() => setShowAllThemes((showAll) => !showAll)}
      >
        {showAllThemes ? "추천 분위기만 보기" : `다른 분위기 ${hiddenThemeCount}개 보기`}
      </button>
    </section>
  );
}
