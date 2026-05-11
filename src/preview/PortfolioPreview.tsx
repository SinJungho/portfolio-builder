"use client";

import React from "react";
import HeroBlock from "./blocks/HeroBlock";
import ProjectGridBlock from "./blocks/ProjectGridBlock";
import SkillsBlock from "./blocks/SkillsBlock";
import ContactBlock from "./blocks/ContactBlock";
import BlogFeedBlock from "./blocks/BlogFeedBlock";
import { DesignTokens } from "../schemas/portfolio";
import { resolveTheme } from "./themes";

import { useSearchParams } from "next/navigation";
import { FileDown, Loader2 } from "lucide-react";

type Block = {
  id: string;
  block_type: string;
  position: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  is_visible: boolean;
};

interface PortfolioPreviewProps {
  blocks: Block[];
  theme: string;
  designTokens?: DesignTokens;
  slug?: string;
}

export default function PortfolioPreview({ blocks, theme, designTokens, slug }: PortfolioPreviewProps) {
  const searchParams = useSearchParams();
  const isExporting = searchParams.get("export") === "true";
  const [isExportPending, setIsExportPending] = React.useState(false);

  const baseTheme = resolveTheme(theme);
  
  // 디자인 토큰 병합 로직 (강조색 및 관련 스타일 강제 대체)
  const primaryColor = designTokens?.primaryColor || baseTheme.accent;
  const mt = {
    ...baseTheme,
    accent: primaryColor,
    ctaBg: primaryColor,
    progressFill: primaryColor,
    decorBar: primaryColor,
    accentGradient: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
    accentSoft: `${primaryColor}15`, 
    glowColor: `${primaryColor}20`,
    heroGlow: `${primaryColor}10`,
    cardRadius: designTokens?.borderRadius === "none" ? "0px" :
                designTokens?.borderRadius === "sm" ? "8px" :
                designTokens?.borderRadius === "md" ? "16px" :
                designTokens?.borderRadius === "lg" ? "24px" :
                designTokens?.borderRadius === "full" ? "9999px" : baseTheme.cardRadius
  };

  // 폰트 매핑
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    pretendard: "'Pretendard', sans-serif",
    "fira-code": "'Fira Code', monospace",
    playfair: "'Playfair Display', serif",
  };
  const fontFamily = fontMap[designTokens?.fontFamily || "inter"] || fontMap.inter;

  // 간격 매핑 (Spacing Mapping - 정석 수치 반영)
  const spacingClassMap = {
    compact: "py-10 md:py-16",
    normal: "py-16 md:py-24",
    relaxed: "py-24 md:py-40",
  };
  const spacingClass = spacingClassMap[designTokens?.spacing as keyof typeof spacingClassMap] || spacingClassMap.normal;

  const visibleBlocks = blocks
    .filter((b) => b.is_visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: mt.bg,
        color: mt.text,
        backgroundImage: mt.pageBgGradient || "none",
        fontFamily,
        scrollBehavior: "smooth",
      }}
    >
      {visibleBlocks.map((block) => {
        // Hero uses full-bleed (no container)
        if (block.block_type === "hero") {
          return (
            <div key={block.id} className={`max-w-[1100px] mx-auto px-6 md:px-8 ${spacingClass}`}>
              <HeroBlock config={block.config} theme={mt} />
            </div>
          );
        }

        // Contact is nearly full bleed
        if (block.block_type === "contact") {
          return (
            <div key={block.id} className={`max-w-[1100px] mx-auto px-6 md:px-8 ${spacingClass}`}>
              <ContactBlock config={block.config} theme={mt} />
            </div>
          );
        }

        // All other blocks: contained with generous spacing
        return (
          <div key={block.id} className={`max-w-[1100px] mx-auto px-6 md:px-8 ${spacingClass}`}>
            {block.block_type === "project_grid" && (
              <ProjectGridBlock config={block.config} theme={mt} />
            )}
            {block.block_type === "skills" && (
              <SkillsBlock config={block.config} theme={mt} />
            )}
            {block.block_type === "blog_feed" && (
              <BlogFeedBlock config={block.config} theme={mt} />
            )}
          </div>
        );
      })}

      {/* PDF Download Button (Hidden during export) */}
      {!isExporting && slug && (
        <div className="fixed bottom-8 right-8 z-50 print:hidden">
          <button
            onClick={() => {
              setIsExportPending(true);
              // API 엔드포인트 호출
              window.location.href = `/api/export/pdf?slug=${slug}`;
              // 다운로드 시작 후 약간의 지연 후 로딩 상태 해제
              setTimeout(() => setIsExportPending(false), 5000);
            }}
            disabled={isExportPending}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 backdrop-blur-md border border-black/5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-95 text-[#191F28] font-bold text-sm"
          >
            {isExportPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            PDF 내보내기
          </button>
        </div>
      )}
    </div>
  );
}
