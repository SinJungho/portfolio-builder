"use client";

import React from "react";
import AccessibilityAlert from "./design/AccessibilityAlert";
import ThemeSelector from "./design/ThemeSelector";
import ColorCustomizer from "./design/ColorCustomizer";
import TypographyAndDetails from "./design/TypographyAndDetails";
import CustomCssEditor from "./design/CustomCssEditor";

export default function DesignEditor() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      <AccessibilityAlert />
      <ThemeSelector />
      <details className="rounded-2xl border border-white/5 bg-spotify-dark-surface p-5">
        <summary className="cursor-pointer list-none font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
          더 조정하기 <span className="ml-2 text-[12px] font-medium text-spotify-silver">색상, 글꼴, 여백을 바꿀 수 있어요.</span>
        </summary>
        <div className="mt-8 space-y-10"><ColorCustomizer /><TypographyAndDetails /></div>
      </details>
      <details className="rounded-2xl border border-white/5 bg-spotify-dark-surface p-5">
        <summary className="cursor-pointer list-none font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
          고급 CSS 편집 <span className="ml-2 text-[12px] font-medium text-spotify-silver">코드를 아는 경우에만 사용하세요.</span>
        </summary>
        <div className="mt-8"><CustomCssEditor /></div>
      </details>
    </div>
  );
}
