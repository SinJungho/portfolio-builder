"use client";

import React from "react";
import AccessibilityAlert from "./design/AccessibilityAlert";
import ThemeSelector from "./design/ThemeSelector";
import ColorCustomizer from "./design/ColorCustomizer";
import TypographyAndDetails from "./design/TypographyAndDetails";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DEFAULT_DESIGN_TOKENS,
  DEFAULT_PORTFOLIO_THEME,
} from "@/preview/themes";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { ChevronDown } from "lucide-react";

export default function DesignEditor() {
  const {
    isSaving,
    previousDesign,
    failedDesign,
    designError,
    designTokens,
    applyDesign,
    undoDesign,
  } = usePortfolioStore();

  const resetDesign = () => applyDesign({
    theme: DEFAULT_PORTFOLIO_THEME,
    designTokens: {
      ...DEFAULT_DESIGN_TOKENS,
      ...(typeof designTokens.customCss === "string"
        ? { customCss: designTokens.customCss }
        : {}),
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 pb-20">
      <header className="flex flex-col gap-4 rounded-lg border border-white/5 bg-spotify-dark-surface p-5">
        <div>
          <p className="text-[12px] font-bold text-spotify-green">채용 담당자가 읽기 좋은 기본 설정</p>
          <h2 className="mt-2 text-[20px] font-bold text-white">포트폴리오 분위기와 읽는 방식을 정해요</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-spotify-silver">
            고른 결과는 오른쪽 미리보기에 바로 반영되고 자동 저장돼요. 처음이라면 추천 기본 설정 그대로 공개해도 충분해요.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                size="sm"
                className="rounded-full bg-white px-4 font-bold text-black hover:bg-spotify-near-white"
                disabled={isSaving}
              >
                채용 기본 설정으로 되돌리기
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-lg border-none bg-spotify-dark-surface shadow-spotify">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-bold text-white">기본 설정으로 되돌릴까요?</AlertDialogTitle>
                <AlertDialogDescription className="text-[13px] leading-relaxed text-spotify-silver">
                  현재 테마와 색상·글꼴 설정이 채용 담당자용 추천 설정으로 바뀌고 자동 저장돼요. 직접 입력한 CSS는 유지돼요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="pt-4">
                <AlertDialogCancel className="rounded-full border border-white/10 bg-transparent font-bold text-white hover:bg-white/5">취소</AlertDialogCancel>
                <AlertDialogAction onClick={resetDesign} className="rounded-full bg-white font-bold text-black hover:bg-spotify-near-white">기본 설정 적용</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="rounded-full px-4 font-bold text-spotify-silver hover:bg-white/10 hover:text-white"
            onClick={() => undoDesign()}
            disabled={isSaving || !previousDesign}
          >
            마지막 변경 되돌리기
          </Button>
        </div>
      </header>
      {designError && (
        <div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-spotify-negative/30 bg-spotify-negative/10 px-4 py-3 text-[13px] font-bold text-spotify-negative">
          <span>디자인을 저장하지 못했어요. 기존 설정은 유지돼요.</span>
          <Button type="button" size="sm" variant="outline" className="rounded-full border-spotify-negative/40 bg-transparent text-spotify-negative hover:bg-spotify-negative/10" onClick={() => failedDesign ? applyDesign(failedDesign) : resetDesign()}>
            {failedDesign ? "다시 저장" : "기본 설정 사용"}
          </Button>
        </div>
      )}
      <AccessibilityAlert />
      <ThemeSelector />
      <details className="group rounded-lg border border-white/5 bg-spotify-dark-surface p-5">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
          <span>고급 조정 <span className="ml-2 text-[12px] font-medium text-spotify-silver">추천 설정은 그대로 두고 색·글꼴·정보 밀도만 바꿔요.</span></span>
          <ChevronDown className="h-4 w-4 shrink-0 text-spotify-silver transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-8 space-y-10"><ColorCustomizer /><TypographyAndDetails /></div>
      </details>
    </div>
  );
}
