"use client";

import React, { useState } from "react";
import { BlockConfig, DesignTokens } from "../schemas/portfolio";
import { Block } from "../stores/portfolioStore";
import BlogFeedBlock from "./blocks/BlogFeedBlock";
import ContactBlock from "./blocks/ContactBlock";
import HeroBlock from "./blocks/HeroBlock";
import ProjectGridBlock from "./blocks/ProjectGridBlock";
import SkillsBlock from "./blocks/SkillsBlock";
import { hasContactMethod } from "./contact";
import { FONT_STACK, HEADING_FONT_OVERRIDE, previewFontClass } from "./fonts";
import ResumePdfDocument from "./ResumePdfDocument";
import { sanitizeCss } from "./sanitize-css";
import {
  accentForSurface,
  DEFAULT_DESIGN_TOKENS,
  readableTextOn,
  resolveTheme,
  type ThemeTokens,
} from "./themes";

import { cn } from "@/lib/utils";
import { blockDisplayName } from "@/lib/block-labels";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";
import { FileDown, Loader2, Pencil } from "lucide-react";
import { useSearchParams } from "next/navigation";

const EXPORT_BUTTON_CLASS =
  "flex min-h-11 items-center justify-center gap-2 px-5 py-3 rounded-full border " +
  "hover:-translate-y-1 transition-all " +
  "active:scale-95 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-2 focus-visible:outline-offset-2";

const REDUCED_MOTION_CSS =
  "@media (prefers-reduced-motion: reduce){" +
  ".pf-root *,.pf-root *::before,.pf-root *::after{" +
  "transition-duration:0.01ms !important;animation-duration:0.01ms !important;" +
  "animation-iteration-count:1 !important;scroll-behavior:auto !important;}}";

const CTA_BADGE_CSS =
  ".group:hover .pf-cta-badge,.group:focus-visible .pf-cta-badge{" +
  "background-color:var(--cta-badge-bg-active) !important;" +
  "color:var(--cta-badge-fg-active) !important;border-color:transparent !important;}";

const SPACING_CLASS = {
  compact: "py-10 md:py-14",
  normal: "py-16 md:py-24",
  relaxed: "py-20 md:py-32",
} as const;

const HERO_SPACING_CLASS = {
  compact: "pb-10 md:pb-14",
  normal: "pb-16 md:pb-24",
  relaxed: "pb-20 md:pb-32",
} as const;

function getBlockWrapperClass(
  isHero: boolean,
  isFirst: boolean,
  spacing?: DesignTokens["spacing"],
): string {
  const divider = !isHero && !isFirst ? " border-t" : "";
  return cn(
    "max-w-[1100px] mx-auto px-6 md:px-8 pdf-block",
    isHero
      ? HERO_SPACING_CLASS[spacing || "normal"]
      : `${SPACING_CLASS[spacing || "normal"]}${divider}`,
  );
}

interface PortfolioPreviewProps {
  blocks: Block[];
  theme: string;
  designTokens?: DesignTokens;
  slug?: string;
  portfolioId?: string;
  highlightedBlockId?: string | null;
  previewViewport?: "desktop" | "tablet" | "mobile";
  onSelectBlock?: (block: Block) => void;
  ownerName?: string | null;
  portfolioTitle?: string | null;
}

interface PdfExportButtonProps {
  slug: string;
  isPending: boolean;
  error: string | null;
  onExport: (slug: string) => void;
  theme: ThemeTokens;
  containerClassName: string;
  buttonClassName?: string;
}

export default function PortfolioPreview({
  blocks,
  theme,
  designTokens,
  slug,
  portfolioId,
  highlightedBlockId,
  previewViewport = "desktop",
  onSelectBlock,
  ownerName,
  portfolioTitle,
}: PortfolioPreviewProps) {
  const searchParams = useSearchParams();
  const isExporting = searchParams.get("export") === "true";
  const [isExportPending, setIsExportPending] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const resolvedDesignTokens = { ...DEFAULT_DESIGN_TOKENS, ...(designTokens || {}) };

  const baseTheme = resolveTheme(theme);
  const primaryColor = resolvedDesignTokens.primaryColor || baseTheme.accent;
  const functionalAccent = resolvedDesignTokens.primaryColor
    ? accentForSurface(
        accentForSurface(primaryColor, baseTheme.bg, baseTheme.accent),
        baseTheme.cardBg,
        baseTheme.accent,
      )
    : baseTheme.accent;

  const mt = {
    ...baseTheme,
    accent: functionalAccent,
    ctaBg: primaryColor,
    ctaText: resolvedDesignTokens.primaryColor ? readableTextOn(primaryColor) : baseTheme.ctaText,
    cardRadius:
      resolvedDesignTokens.borderRadius === "none"
        ? "0px"
        : resolvedDesignTokens.borderRadius === "sm"
          ? "8px"
          : resolvedDesignTokens.borderRadius === "md"
            ? "16px"
            : resolvedDesignTokens.borderRadius === "lg"
              ? "24px"
              : resolvedDesignTokens.borderRadius === "full"
                ? "9999px"
                : baseTheme.cardRadius,
  };

  const fontKey = resolvedDesignTokens.fontFamily || "inter";
  const fontFamily = FONT_STACK[fontKey] || FONT_STACK.inter;
  const headingFont = HEADING_FONT_OVERRIDE[fontKey];

  const visibleBlocks = blocks
    .filter((block: Block) => block.is_visible)
    .sort((a: Block, b: Block) => a.position - b.position);

  if (isExporting) {
    return (
      <ResumePdfDocument
        blocks={visibleBlocks}
        ownerName={ownerName}
        portfolioTitle={portfolioTitle}
      />
    );
  }

  const canContact = hasContactMethod(visibleBlocks);
  // 히어로가 없어도 문서 제목을 유지한다.
  const hasVisibleHero = visibleBlocks.some((block: Block) => block.block_type === "hero");
  const heroHeadline = (
    blocks.find((block: Block) => block.block_type === "hero")?.config as { headline?: string } | undefined
  )?.headline;
  const hasProjects = visibleBlocks.some((block: Block) => {
    if (block.block_type !== "project_grid") return false;
    const config = block.config as { projectsData?: unknown[] };
    return Boolean(config.projectsData?.length);
  });
  // 내용 없는 블록은 렌더링 목록에서 제외한다.
  const renderableBlocks = visibleBlocks.filter((block: Block) => {
    const config = block.config as {
      skills?: unknown[];
      feed_items?: unknown[];
      projectsData?: unknown[];
    };
    switch (block.block_type) {
      case "project_grid":
        return Boolean(config.projectsData?.length) || Boolean(onSelectBlock);
      case "skills":
        return Boolean(config.skills?.length);
      case "blog_feed":
        return Boolean(config.feed_items?.length);
      case "contact":
        return hasContactMethod([block]);
      default:
        return true;
    }
  });

  const containerStyle: React.CSSProperties = {
    backgroundColor: mt.bg,
    color: mt.text,
    fontFamily,
    scrollBehavior: "smooth",
  };

  const handlePdfExport = async (targetSlug: string): Promise<void> => {
    setIsExportPending(true);
    setExportError(null);
    try {
      const res = await fetch(
        `/api/export/pdf?slug=${encodeURIComponent(targetSlug)}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(responseErrorMessage(body, "PDF_FAILED"));
      }
      const blob = await res.blob();
      if (!blob.size || !blob.type.includes("application/pdf")) {
        throw new Error(errorMessage("PDF_FAILED"));
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${targetSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 0);
    } catch (e) {
      setExportError(
        e instanceof Error
          ? e.message
          : errorMessage("PDF_FAILED"),
      );
    } finally {
      setIsExportPending(false);
    }
  };

  return (
    <div
      id="top"
      className={cn("pf-root w-full", previewFontClass)}
      style={containerStyle}
    >
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-bold focus:outline-2 focus:outline-offset-2"
        style={{ backgroundColor: mt.ctaBg, color: mt.ctaText, outlineColor: mt.accent }}
      >
        본문 바로가기
      </a>
      <style dangerouslySetInnerHTML={{ __html: REDUCED_MOTION_CSS + CTA_BADGE_CSS }} />

      {headingFont && (
        <style
          dangerouslySetInnerHTML={{
            __html: `.pf-root h1,.pf-root h2,.pf-root h3{font-family:${headingFont}}`,
          }}
        />
      )}

      {resolvedDesignTokens.customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: sanitizeCss(resolvedDesignTokens.customCss),
          }}
        />
      )}

      <div id="content" tabIndex={-1} className="outline-none">
      {!hasVisibleHero && <h1 className="sr-only">{heroHeadline || "포트폴리오"}</h1>}
      {renderableBlocks.map((block: Block, i: number) => {
        const isHero = block.block_type === "hero";
        const isFirst = i === 0;
        const hasDivider = !isHero && !isFirst;

        return (
          <div
            key={block.id}
            className={cn(
              getBlockWrapperClass(isHero, isFirst, resolvedDesignTokens.spacing),
              onSelectBlock && "group/editor relative",
            )}
            style={{
              ...(hasDivider ? { borderTopColor: mt.cardBorder } : {}),
              ...(block.id === highlightedBlockId
                ? { boxShadow: `0 0 0 2px ${mt.accent}` }
                : {}),
            }}
          >
            {onSelectBlock && (
              <button
                type="button"
                onClick={() => onSelectBlock(block)}
                aria-label={`${blockDisplayName[block.block_type] || "섹션"} 편집`}
                title={`${blockDisplayName[block.block_type] || "섹션"} 편집`}
                className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/70 text-white opacity-80 shadow-spotify backdrop-blur-sm transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{ outlineColor: mt.accent }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only">{blockDisplayName[block.block_type] || "섹션"} 편집</span>
              </button>
            )}
            {block.block_type === "hero" && (
              <HeroBlock
                config={
                  block.config as Extract<
                    BlockConfig,
                    { block_type: "hero" }
                  >["config"]
                }
                theme={mt}
                showContactLink={canContact}
                showProjectsLink={hasProjects}
                isCompactPreview={previewViewport === "mobile"}
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
                isCompactPreview={previewViewport === "mobile"}
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
      </div>

      <footer
        className="border-t"
        style={{
          backgroundColor: mt.footerBg,
          color: mt.footerText,
          borderColor: mt.cardBorder,
        }}
      >
        <div className="mx-auto max-w-[1100px] px-6 py-10 text-sm md:px-8">
          <div className="flex items-center justify-between gap-4">
            <span>포지로 만든 포트폴리오</span>
            <a
              href="#top"
              className="font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 print:hidden"
              style={{ color: mt.text, outlineColor: mt.accent }}
            >
              맨 위로 ↑
            </a>
          </div>
          {slug && (
            <PdfExportButton
              slug={slug}
              isPending={isExportPending}
              error={exportError}
              onExport={handlePdfExport}
              theme={mt}
              containerClassName="mt-6 md:hidden print:hidden"
              buttonClassName="w-full"
            />
          )}
        </div>
      </footer>

      {slug && (
        <PdfExportButton
          slug={slug}
          isPending={isExportPending}
          error={exportError}
          onExport={handlePdfExport}
          theme={mt}
          containerClassName="fixed bottom-8 right-8 z-50 hidden md:block print:hidden"
        />
      )}
    </div>
  );
}

function PdfExportButton({
  slug,
  isPending,
  error,
  onExport,
  theme,
  containerClassName,
  buttonClassName = "",
}: PdfExportButtonProps) {
  return (
    <div className={containerClassName}>
      {error && (
        <p
          role="alert"
          className="mb-2 max-w-[260px] ml-auto text-right text-xs font-semibold rounded-lg px-3 py-2 shadow-lg"
          style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
        >
          {error}
        </p>
      )}
      <button
        onClick={() => onExport(slug)}
        disabled={isPending}
        type="button"
        aria-busy={isPending}
        className={`${EXPORT_BUTTON_CLASS} ${buttonClassName}`}
        style={{
          backgroundColor: theme.cardBg,
          color: theme.text,
          borderColor: theme.cardBorder,
          outlineColor: theme.accent,
        }}
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        ) : (
          <FileDown className="w-4 h-4" aria-hidden="true" />
        )}
        PDF 내보내기
      </button>
    </div>
  );
}
