"use client";

import { THEMES, ThemeTokens } from "@/preview/themes";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { Check, Palette } from "lucide-react";

export default function ThemeSelector() {
  const { theme, setTheme } = usePortfolioStore();

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
            테마 스타일
          </h3>
        </div>
        <span className="text-[11px] font-bold text-spotify-silver bg-white/5 px-3 py-1 rounded-full tracking-spotify">
          기본 프리셋
        </span>
      </header>

      <div
        className="grid grid-cols-2 gap-4"
        role="radiogroup"
        aria-labelledby="theme-selector-heading"
      >
        {Object.values(THEMES).map((themeItem: ThemeTokens) => (
          <button
            key={themeItem.id}
            role="radio"
            aria-checked={theme === themeItem.id}
            onClick={() => setTheme(themeItem.id)}
            className={`
              group relative flex flex-col gap-5 p-6 rounded-xl transition-all duration-300 text-left overflow-hidden border border-transparent
              ${
                theme === themeItem.id
                  ? "bg-spotify-mid-dark shadow-spotify-md border-white/10"
                  : "bg-spotify-dark-surface hover:bg-spotify-mid-dark"
              }
              active:scale-[0.98]
            `}
          >
            <div className="flex items-center justify-between z-10 w-full">
              <span
                className={`text-[15px] font-bold ${
                  theme === themeItem.id
                    ? "text-spotify-green"
                    : "text-spotify-silver group-hover:text-white"
                }`}
              >
                {themeItem.label}
              </span>
              {theme === themeItem.id && (
                <div
                  className="w-5 h-5 rounded-full bg-spotify-green flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                </div>
              )}
            </div>
            <div className="flex gap-1.5 h-6 w-full z-10" aria-hidden="true">
              <div
                className="flex-1 rounded-md border border-white/5"
                style={{ backgroundColor: themeItem.bg }}
              />
              <div
                className="flex-1 rounded-md border border-white/5"
                style={{ backgroundColor: themeItem.accent }}
              />
              <div
                className="flex-1 rounded-md border border-white/5"
                style={{ backgroundColor: themeItem.text }}
              />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
