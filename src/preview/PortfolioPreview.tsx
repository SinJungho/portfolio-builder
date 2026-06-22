"use client";

import React, { useState } from "react";
import { BlockConfig, DesignTokens } from "../schemas/portfolio";
import { Block } from "../stores/portfolioStore";
import BlogFeedBlock from "./blocks/BlogFeedBlock";
import ContactBlock from "./blocks/ContactBlock";
import HeroBlock from "./blocks/HeroBlock";
import ProjectGridBlock from "./blocks/ProjectGridBlock";
import SkillsBlock from "./blocks/SkillsBlock";
import { resolveTheme } from "./themes";

import { cn } from "@/lib/utils";
import { FileDown, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

const FONT_FAMILY_MAP: Record<string, string> = {
  inter: "'Inter', sans-serif",
  pretendard: "'Pretendard', sans-serif",
  "fira-code": "'Fira Code', monospace",
  playfair: "'Playfair Display', serif",
};

const EXPORT_BUTTON_CONTAINER_CLASS =
  "fixed bottom-8 right-8 z-50 print:hidden";
const EXPORT_BUTTON_CLASS =
  "flex items-center gap-2 px-5 py-3 rounded-full bg-white/80 backdrop-blur-md " +
  "border border-black/5 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all " +
  "active:scale-95 text-[#191F28] font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed";

function getBlockWrapperClass(isHero: boolean): string {
  return cn(
    "max-w-[1100px] mx-auto px-6 md:px-8 pdf-block",
    isHero ? "pb-16 md:pb-24" : "py-16 md:py-24 border-t border-ink-100/10",
  );
}

interface PortfolioPreviewProps {
  blocks: Block[];
  theme: string;
  designTokens?: DesignTokens;
  slug?: string;
  portfolioId?: string;
}

interface PdfExportButtonProps {
  slug: string;
  isPending: boolean;
  onExport: (slug: string) => void;
}

export default function PortfolioPreview({
  blocks,
  theme,
  designTokens,
  slug,
  portfolioId,
}: PortfolioPreviewProps) {
  const searchParams = useSearchParams();
  const isExporting = searchParams.get("export") === "true";
  const [isExportPending, setIsExportPending] = useState(false);

  const baseTheme = resolveTheme(theme);
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
    cardRadius:
      designTokens?.borderRadius === "none"
        ? "0px"
        : designTokens?.borderRadius === "sm"
          ? "8px"
          : designTokens?.borderRadius === "md"
            ? "16px"
            : designTokens?.borderRadius === "lg"
              ? "24px"
              : designTokens?.borderRadius === "full"
                ? "9999px"
                : baseTheme.cardRadius,
  };

  const fontFamily =
    FONT_FAMILY_MAP[designTokens?.fontFamily || "inter"] ||
    FONT_FAMILY_MAP.inter;

  const visibleBlocks = blocks
    .filter((block: Block) => block.is_visible)
    .sort((a: Block, b: Block) => a.position - b.position);

  const containerStyle: React.CSSProperties = {
    backgroundColor: mt.bg,
    color: mt.text,
    backgroundImage: mt.pageBgGradient || "none",
    fontFamily,
    scrollBehavior: "smooth",
  };

  const handlePdfExport = (targetSlug: string): void => {
    setIsExportPending(true);
    window.location.href = `/api/export/pdf?slug=${targetSlug}`;

    // PDF 다운로드 완료 전 UI 중복 제출 방지 지연
    setTimeout(() => {
      setIsExportPending(false);
    }, 5000);
  };

  return (
    <div className="w-full" style={containerStyle}>
      {isExporting && (
        <style
          dangerouslySetInnerHTML={{
            __html: getExportStyles(mt.accent, mt.cardBg),
          }}
        />
      )}

      {designTokens?.customCss && (
        <style dangerouslySetInnerHTML={{ __html: designTokens.customCss }} />
      )}

      {visibleBlocks.map((block: Block) => {
        const isHero = block.block_type === "hero";

        return (
          <div key={block.id} className={getBlockWrapperClass(isHero)}>
            {block.block_type === "hero" && (
              <HeroBlock
                config={
                  block.config as Extract<
                    BlockConfig,
                    { block_type: "hero" }
                  >["config"]
                }
                theme={mt}
              />
            )}
            {block.block_type === "project_grid" && (
              <ProjectGridBlock
                config={
                  block.config as Extract<
                    BlockConfig,
                    { block_type: "project_grid" }
                  >["config"]
                }
                theme={mt}
                portfolioId={portfolioId}
                blockId={block.id}
              />
            )}
            {block.block_type === "skills" && (
              <SkillsBlock
                config={
                  block.config as Extract<
                    BlockConfig,
                    { block_type: "skills" }
                  >["config"]
                }
                theme={mt}
              />
            )}
            {block.block_type === "blog_feed" && (
              <BlogFeedBlock
                config={
                  block.config as Extract<
                    BlockConfig,
                    { block_type: "blog_feed" }
                  >["config"]
                }
                theme={mt}
              />
            )}
            {block.block_type === "contact" && (
              <ContactBlock
                config={
                  block.config as Extract<
                    BlockConfig,
                    { block_type: "contact" }
                  >["config"]
                }
                theme={mt}
                portfolioId={portfolioId}
                blockId={block.id}
              />
            )}
          </div>
        );
      })}

      {!isExporting && slug && (
        <PdfExportButton
          slug={slug}
          isPending={isExportPending}
          onExport={handlePdfExport}
        />
      )}
    </div>
  );
}

function PdfExportButton({ slug, isPending, onExport }: PdfExportButtonProps) {
  return (
    <div className={EXPORT_BUTTON_CONTAINER_CLASS}>
      <button
        onClick={() => onExport(slug)}
        disabled={isPending}
        className={EXPORT_BUTTON_CLASS}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileDown className="w-4 h-4" />
        )}
        PDF 내보내기
      </button>
    </div>
  );
}

function getExportStyles(accentColor: string, cardBgColor: string): string {
  return `
    @import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css');
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');

    @media print {
      * { 
        -webkit-print-color-adjust: exact !important; 
        color-adjust: exact !important; 
      }
    }
    
    /* PDF 출력 시 배경 블러/글로우 제거 */
    .absolute.blur-[140px], .absolute.blur-[120px], .absolute.blur-[100px], .absolute.blur-2xl {
      display: none !important;
    }
    
    /* 텍스트 그라데이션 소실 방지 */
    h1.bg-clip-text, h2.bg-clip-text, span.bg-clip-text {
      -webkit-text-fill-color: initial !important;
      background-clip: border-box !important;
      background: none !important;
      color: ${accentColor} !important;
    }
    
    /* 글래스모피즘 효과 오버라이드 */
    .backdrop-blur-md, .backdrop-blur-lg, .backdrop-blur-xl {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      background-color: ${cardBgColor} !important;
      opacity: 1 !important;
    }
    
    /* 애니메이션 비활성화 */
    .animate-ping, .animate-bounce, .animate-pulse {
      animation: none !important;
      display: none !important;
    }
    
    /* A4 세로 여백 압축 */
    .pdf-block {
      page-break-inside: auto !important;
      break-inside: auto !important;
      padding-top: 1.5rem !important;
      padding-bottom: 1.5rem !important;
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
    
    /* 페이지 경계에서 요소가 잘리는 현상 방지 */
    .pdf-block > *, 
    .pdf-block section, 
    .pdf-block h1, 
    .pdf-block h2, 
    .pdf-block h3, 
    .pdf-block h4,
    .pdf-block li,
    .pdf-block tr,
    .pdf-block p,
    .pdf-block img,
    .pdf-block div.grid > div,
    .pdf-block div.flex-wrap > div {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
  `;
}
