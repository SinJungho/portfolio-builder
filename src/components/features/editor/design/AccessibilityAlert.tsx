"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { THEMES } from "@/preview/themes";
import { getContrastRatio } from "@/utils/accessibility";

export default function AccessibilityAlert() {
  const { theme, designTokens, setDesignTokens } = usePortfolioStore();

  const currentTheme = THEMES[theme] || THEMES.minimal;
  const primaryColor =
    (designTokens?.primaryColor as string) || currentTheme?.accent || "#1ed760";

  // 링크와 포커스 링 등 배경 위 기능 요소의 대비를 검사한다.
  const contrastBg = getContrastRatio(primaryColor, currentTheme.bg);
  const contrastCard = getContrastRatio(
    primaryColor,
    currentTheme.cardBg,
    currentTheme.bg,
  );
  const hasCustomPrimaryColor = typeof designTokens?.primaryColor === "string" &&
    designTokens.primaryColor !== currentTheme.accent;
  const hasA11yIssue = hasCustomPrimaryColor && (contrastBg < 3 || contrastCard < 3);

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
            강조 색상이 배경에서 잘 보이지 않을 수 있어요
          </AlertTitle>
          <AlertDescription className="text-[13px] font-medium leading-relaxed opacity-90">
            링크, 포커스 표시, 진행 상태는 배경과 3:1 이상 차이 나야 잘 보여요. 이 경고는 공개를 막지 않아요.
            <div className="flex gap-4 mt-3 pt-3 border-t border-spotify-warning/10">
              <div className="text-[11px] font-bold tracking-spotify text-spotify-warning/80">
                명도 대비율:
              </div>
              <div className="flex gap-3 text-[12px] font-mono font-bold">
                <span
                  className={
                    contrastBg < 3
                      ? "text-spotify-negative"
                      : "text-spotify-green"
                  }
                >
                  배경: {contrastBg.toFixed(1)}
                </span>
                <span
                  className={
                    contrastCard < 3
                      ? "text-spotify-negative"
                      : "text-spotify-green"
                  }
                >
                  카드: {contrastCard.toFixed(1)}
                </span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4 h-9 rounded-full border-spotify-warning/40 bg-transparent px-4 text-[12px] font-bold text-spotify-warning hover:bg-spotify-warning/10 hover:text-spotify-warning"
              onClick={() => setDesignTokens({ primaryColor: undefined })}
            >
              테마 기본 색상 사용
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
