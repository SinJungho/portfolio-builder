"use client";

import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { accentForSurface, resolveTheme } from "@/preview/themes";
import { getContrastRatio } from "@/utils/accessibility";

export default function AccessibilityAlert() {
  const { theme, designTokens, setDesignTokens } = usePortfolioStore();

  const currentTheme = resolveTheme(theme);
  const primaryColor =
    (designTokens?.primaryColor as string) || currentTheme?.accent || "#1ed760";

  // 공개 미리보기에서 실제로 쓰는 기능 액센트(커스텀 색상이 배경 대비를 통과하지 못하면 테마 색상으로 대체)를 검사한다.
  const functionalAccent = designTokens?.primaryColor
    ? accentForSurface(
        accentForSurface(primaryColor, currentTheme.bg, currentTheme.accent),
        currentTheme.cardBg,
        currentTheme.accent,
      )
    : currentTheme.accent;
  const contrastBg = getContrastRatio(functionalAccent, currentTheme.bg);
  const contrastCard = getContrastRatio(
    functionalAccent,
    currentTheme.cardBg,
    currentTheme.bg,
  );
  const bodyContrast = getContrastRatio(currentTheme.text, currentTheme.bg);
  const cardBodyContrast = getContrastRatio(currentTheme.text, currentTheme.cardBg, currentTheme.bg);
  const mutedContrast = getContrastRatio(currentTheme.textMuted, currentTheme.bg);
  const hasA11yIssue = contrastBg < 3 || contrastCard < 3 || bodyContrast < 4.5 || cardBodyContrast < 4.5 || mutedContrast < 4.5;

  if (!hasA11yIssue) return null;

  return (
    <Alert
      variant="destructive"
      className="bg-spotify-warning/10 border-spotify-warning/20 text-spotify-warning rounded-xl py-6 px-7 shadow-spotify-md animate-in zoom-in-95 duration-500"
    >
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-spotify-warning/20 rounded-full mt-0.5">
          <AlertTriangle className="h-5 w-5 text-spotify-warning" aria-hidden="true" />
        </div>
        <div className="space-y-2">
          <AlertTitle className="text-[16px] font-bold tracking-tight">
            색상 대비를 확인해 주세요
          </AlertTitle>
          <AlertDescription className="text-[13px] font-medium leading-relaxed opacity-90">
            공개 미리보기의 기능 액센트는 3:1 이상, 본문 글자는 4.5:1 이상을 기준으로 확인해요. 공개를 막지는 않지만 채용 담당자가 읽기 어려울 수 있어요.
            <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-spotify-warning/10">
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
                <span className={bodyContrast < 4.5 ? "text-spotify-negative" : "text-spotify-green"}>
                  본문: {bodyContrast.toFixed(1)}
                </span>
                <span className={cardBodyContrast < 4.5 ? "text-spotify-negative" : "text-spotify-green"}>
                  카드 본문: {cardBodyContrast.toFixed(1)}
                </span>
                <span className={mutedContrast < 4.5 ? "text-spotify-negative" : "text-spotify-green"}>
                  보조: {mutedContrast.toFixed(1)}
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
              안전한 테마 색상으로 복구
            </Button>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
