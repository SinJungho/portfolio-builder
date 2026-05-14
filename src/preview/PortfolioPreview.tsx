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
import { cn } from "@/lib/utils";

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

      {/* PDF Export Specific Overrides */}
      {isExporting && (
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
          }
          /* 배경 글로우 효과가 PDF에서 사각형 박스로 나오는 문제 해결 */
          .absolute.blur-[140px], .absolute.blur-[120px], .absolute.blur-[100px], .absolute.blur-2xl {
            display: none !important;
          }
          /* 텍스트 그라데이션이 PDF에서 보이지 않거나 깨지는 문제 해결 (배경색은 유지) */
          h1.bg-clip-text, h2.bg-clip-text, span.bg-clip-text {
            -webkit-text-fill-color: initial !important;
            background-clip: border-box !important;
            background: none !important;
            color: ${mt.accent} !important;
          }
          /* 유리 질감 효과(backdrop-blur)는 PDF에서 지원되지 않으므로 불투명도 조정 */
          .backdrop-blur-md, .backdrop-blur-lg, .backdrop-blur-xl {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background-color: ${mt.cardBg} !important;
            opacity: 1 !important;
          }
          /* 애니메이션 효과 강제 중단 */
          .animate-ping, .animate-bounce, .animate-pulse {
            animation: none !important;
            display: none !important;
          }
          /* 인쇄 시 페이지 나눔 최적화 */
          section, .pdf-block {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        `}} />
      )}

      {/* Custom User CSS Injection */}
      {designTokens?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: designTokens.customCss }} />
      )}


      {visibleBlocks.map((block) => {
        const isHero = block.block_type === "hero";
        
        return (
          <div 
            key={block.id} 
            className={cn(
              "max-w-[1100px] mx-auto px-6 md:px-8 pdf-block",
              isHero ? "pb-16 md:pb-24" : "py-16 md:py-24 border-t border-ink-100/10"
            )}
          >
            {block.block_type === "hero" && (
              <HeroBlock config={block.config} theme={mt} />
            )}
            {block.block_type === "project_grid" && (
              <ProjectGridBlock config={block.config} theme={mt} />
            )}
            {block.block_type === "skills" && (
              <SkillsBlock config={block.config} theme={mt} />
            )}
            {block.block_type === "blog_feed" && (
              <BlogFeedBlock config={block.config} theme={mt} />
            )}
            {block.block_type === "contact" && (
              <ContactBlock config={block.config} theme={mt} />
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
