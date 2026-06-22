"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { THEMES } from "@/preview/themes";
import { getContrastRatio } from "@/utils/accessibility";

export default function AccessibilityAlert() {
  const { theme, designTokens } = usePortfolioStore();

  const currentTheme = THEMES[theme] || THEMES.minimal;
  const primaryColor =
    (designTokens?.primaryColor as string) || currentTheme?.accent || "#1ed760";

  // 배경 및 텍스트 요소 간의 웹 접근성(A11y) 명도 대비 검증
  const contrastBg = getContrastRatio(primaryColor, currentTheme.bg);
  const contrastText = getContrastRatio(primaryColor, currentTheme.text);
  const contrastMuted = getContrastRatio(primaryColor, currentTheme.textMuted);

  const hasA11yIssue =
    contrastBg < 4.5 || contrastText < 4.5 || contrastMuted < 4.5;

  if (!hasA11yIssue) return null;

  return (
    <Alert
      variant="destructive"
      className="bg-spotify-warning/10 border-spotify-warning/20 text-spotify-warning rounded-xl py-6 px-7 shadow-spotify-md animate-in zoom-in-95 duration-500"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-spotify-warning/20 rounded-full mt-0.5">
          <AlertTriangle className="h-5 w-5 text-spotify-warning" />
        </div>
        <div className="space-y-2">
          <AlertTitle className="text-[16px] font-bold tracking-tight">
            가독성이 낮을 수 있습니다
          </AlertTitle>
          <AlertDescription className="text-[13px] font-medium leading-relaxed opacity-90">
            현재 선택한 컬러는 테마 색상과 대비가 낮아 텍스트를 읽기 어려울 수
            있습니다.
            <span className="block mt-1 sm:inline sm:ml-1 underline underline-offset-4 decoration-spotify-warning/30 font-bold">
              최소 4.5:1 이상의 대비도를 권장합니다.
            </span>
            <div className="flex gap-4 mt-3 pt-3 border-t border-spotify-warning/10">
              <div className="text-[11px] font-bold tracking-spotify text-spotify-warning/80">
                명도 대비율:
              </div>
              <div className="flex gap-3 text-[12px] font-mono font-bold">
                <span
                  className={
                    contrastBg < 4.5
                      ? "text-spotify-negative"
                      : "text-spotify-green"
                  }
                >
                  배경: {contrastBg.toFixed(1)}
                </span>
                <span
                  className={
                    contrastText < 4.5
                      ? "text-spotify-negative"
                      : "text-spotify-green"
                  }
                >
                  텍스트: {contrastText.toFixed(1)}
                </span>
                <span
                  className={
                    contrastMuted < 4.5
                      ? "text-spotify-negative"
                      : "text-spotify-green"
                  }
                >
                  보조: {contrastMuted.toFixed(1)}
                </span>
              </div>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
