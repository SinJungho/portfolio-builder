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
import { sanitizeCss } from "./sanitize-css";
import { accentForSurface, readableTextOn, resolveTheme, type ThemeTokens } from "./themes";

import { cn } from "@/lib/utils";
import { FileDown, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

// 모바일 숨김(md+에서만) — 고정 버튼이 엄지 존에서 연락처 CTA를 가리던 문제. 내보내기는
// 사실상 소유자가 데스크톱에서 하는 작업(채용담당자는 폰에서 거의 내보내지 않음).
const EXPORT_BUTTON_CONTAINER_CLASS =
  "hidden md:block fixed bottom-8 right-8 z-50 print:hidden";
// 플랫 엘리베이션 POV 유지 — 그림자/backdrop-blur 없이 cardBg + 1px 보더로 구분(솔리드 배경이라 blur는 무효과였음)
const EXPORT_BUTTON_CLASS =
  "flex items-center gap-2 px-5 py-3 rounded-full border " +
  "hover:-translate-y-1 transition-all " +
  "active:scale-95 font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed " +
  "focus-visible:outline-2 focus-visible:outline-offset-2";

// prefers-reduced-motion: 프리뷰 내 트랜지션·애니메이션 무력화(호버 변형 순간 적용)
const REDUCED_MOTION_CSS =
  "@media (prefers-reduced-motion: reduce){" +
  ".pf-root *,.pf-root *::before,.pf-root *::after{" +
  "transition-duration:0.01ms !important;animation-duration:0.01ms !important;" +
  "animation-iteration-count:1 !important;scroll-behavior:auto !important;}}";

// 프로젝트 행 호버/포커스 시 중립 CTA 배지를 액센트로 승격(색은 배지 인라인 CSS 변수로 테마별 주입).
// 대표작(#01) 배지는 pf-cta-badge 클래스가 없어 이 규칙에 영향받지 않음(항상 그린).
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
  // 구분선은 섹션 사이를 나누는 것 — 첫 블록엔 위 헤어라인을 두지 않는다(히어로 없는
  // 포트폴리오에서 페이지 최상단에 아무것도 없는 구분선이 뜨는 문제 방지).
  const divider = !isHero && !isFirst ? " border-t" : "";
  return cn(
    "max-w-[1100px] mx-auto px-6 md:px-8 pdf-block",
    isHero
      ? HERO_SPACING_CLASS[spacing || "normal"]
      // border-t 색은 인라인 borderTopColor로 — mt.cardBorder는 테마 인식:
      // 다크 위 밝은 헤어라인/라이트 위 어두운 헤어라인. 하드코딩 ink는 다크 테마에서 소실됐음
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
}

interface PdfExportButtonProps {
  slug: string;
  isPending: boolean;
  error: string | null;
  onExport: (slug: string) => void;
  theme: ThemeTokens;
}

export default function PortfolioPreview({
  blocks,
  theme,
  designTokens,
  slug,
  portfolioId,
  highlightedBlockId,
}: PortfolioPreviewProps) {
  const searchParams = useSearchParams();
  const isExporting = searchParams.get("export") === "true";
  const [isExportPending, setIsExportPending] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const baseTheme = resolveTheme(theme);
  const primaryColor = designTokens?.primaryColor || baseTheme.accent;
  // 포커스 링·프로그레스 채움처럼 배경 위 가느다란 기능 요소엔 대비 보장색 사용 —
  // 옅은 커스텀 색은 배경 대비 3:1 미달 시 테마 기본 액센트로 대체(포커스 링 소실 방지, WCAG 2.4.7).
  // 채움(CTA 배경)은 그 위 텍스트가 readableTextOn으로 파생되므로 사용자 색을 그대로 유지.
  // 포커스 링·프로그레스 채움은 페이지 배경(bg)뿐 아니라 카드 표면(cardBg) 위에도 렌더되므로
  // 두 표면 모두에서 3:1을 만족해야 한다. bg→cardBg로 체이닝해 더 빡빡한 쪽까지 통과하지 못하면
  // 테마 기본 액센트로 대체(둘 중 하나라도 미달이면 폴백).
  const functionalAccent = designTokens?.primaryColor
    ? accentForSurface(
        accentForSurface(primaryColor, baseTheme.bg, baseTheme.accent),
        baseTheme.cardBg,
        baseTheme.accent,
      )
    : baseTheme.accent;

  const mt = {
    ...baseTheme,
    accent: functionalAccent, // 포커스 링 등 얇은 기능선 — 대비 보장
    ctaBg: primaryColor, // 채움 — 사용자 색 유지(텍스트는 ctaText로 대비 확보)
    // 커스텀 색 위 CTA 텍스트는 휘도로 파생 — 다크 색 선택 시 다크-온-다크 방지
    ctaText: designTokens?.primaryColor ? readableTextOn(primaryColor) : baseTheme.ctaText,
    // 태그는 항상 무채색(테마 기본값) — 그린/커스텀 색은 기능(CTA·프로그레스·활성)에만.
    // 커스텀 primaryColor를 태그 텍스트로 remap하면 밝은 색 선택 시 저-대비 틴트 위에서 판독 불가(AA 미달).
    // 무채색 태그는 테마가 대비를 보장하므로 이 위험을 원천 제거.
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

  const fontKey = designTokens?.fontFamily || "inter";
  const fontFamily = FONT_STACK[fontKey] || FONT_STACK.inter;
  // 디스플레이 페이스(예: Playfair)는 헤딩에만 — 본문은 위 FONT_STACK(산세리프)
  const headingFont = HEADING_FONT_OVERRIDE[fontKey];

  const visibleBlocks = blocks
    .filter((block: Block) => block.is_visible)
    .sort((a: Block, b: Block) => a.position - b.position);
  const canContact = hasContactMethod(visibleBlocks);
  // 히어로가 숨김/삭제돼도 문서에 h1이 하나는 있도록 — 스크린리더 헤딩 내비게이션·문서 개요 보장.
  // 히어로가 보이면 그 안의 h1을 쓰고, 없을 때만 히어로 headline(숨김 포함)이나 기본값으로 sr-only h1 렌더.
  const hasVisibleHero = visibleBlocks.some((block: Block) => block.block_type === "hero");
  const heroHeadline = (
    blocks.find((block: Block) => block.block_type === "hero")?.config as { headline?: string } | undefined
  )?.headline;
  // 블록 존재가 아니라 실제 렌더될 데이터 유무로 판정 — 빈 project_grid는 안내용
  // 빈 상태만 렌더하므로, 점프할 프로젝트가 있을 때만 히어로 '프로젝트 보기'를 노출한다.
  const hasProjects = visibleBlocks.some((block: Block) => {
    if (block.block_type !== "project_grid") return false;
    const config = block.config as { projectsData?: unknown[] };
    return Boolean(config.projectsData?.length);
  });
  // 빈 데이터로 null을 반환하는 블록(스킬 0개·피드 0개·연락 수단 없음)은 렌더 목록에서 제외 —
  // 안 그러면 내용 없는 패딩 밴드와 그 위 상단 구분선만 남아 채용담당자에게 깨진 여백으로 보인다.
  // project_grid는 안내용 빈 상태를 스스로 렌더하므로 제외 대상 아님, hero는 항상 렌더.
  const renderableBlocks = visibleBlocks.filter((block: Block) => {
    const config = block.config as { skills?: unknown[]; feed_items?: unknown[] };
    switch (block.block_type) {
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

  // 실제 요청 상태에 맞춰 진행/실패를 반영 — 실패 시 조용히 스피너만 멈추던 문제 해결
  const handlePdfExport = async (targetSlug: string): Promise<void> => {
    setIsExportPending(true);
    setExportError(null);
    try {
      const res = await fetch(
        `/api/export/pdf?slug=${encodeURIComponent(targetSlug)}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || "PDF 생성을 실패했습니다.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${targetSlug}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setExportError(
        e instanceof Error
          ? e.message
          : "PDF 내보내기에 실패했어요. 잠시 후 다시 시도해 주세요.",
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
      {/* 키보드/스크린리더 사용자용 본문 바로가기 — 평소 숨김, 포커스 시 노출 */}
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-bold focus:outline-2 focus:outline-offset-2"
        style={{ backgroundColor: mt.ctaBg, color: mt.ctaText, outlineColor: mt.accent }}
      >
        본문 바로가기
      </a>
      {/* 폰트는 전부 next/font로 자가호스팅(fonts.ts) — 별도 <link>/CDN 없음 */}
      <style dangerouslySetInnerHTML={{ __html: REDUCED_MOTION_CSS + CTA_BADGE_CSS }} />

      {/* 디스플레이 폰트(Playfair)는 헤딩에만 스코프 — 본문은 산세리프로 가독 유지 */}
      {headingFont && (
        <style
          dangerouslySetInnerHTML={{
            __html: `.pf-root h1,.pf-root h2,.pf-root h3{font-family:${headingFont}}`,
          }}
        />
      )}

      {isExporting && (
        <style
          dangerouslySetInnerHTML={{
            __html: getExportStyles(mt.cardBg),
          }}
        />
      )}

      {designTokens?.customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: sanitizeCss(designTokens.customCss),
          }}
        />
      )}

      {/* 랜드마크 <main>은 호출부(공개 [slug] 페이지·에디터)가 소유 — 여기선 중첩 방지 위해 div */}
      <div id="content" tabIndex={-1} className="outline-none">
      {/* 히어로가 없을 때만 — 문서에 h1이 항상 하나 존재하도록 시각적 숨김 제목 */}
      {!hasVisibleHero && <h1 className="sr-only">{heroHeadline || "포트폴리오"}</h1>}
      {renderableBlocks.map((block: Block, i: number) => {
        const isHero = block.block_type === "hero";
        const isFirst = i === 0;
        const hasDivider = !isHero && !isFirst;

        return (
          <div
            key={block.id}
            className={getBlockWrapperClass(isHero, isFirst, designTokens?.spacing)}
            // 섹션 구분선 색 — 테마 인식 토큰(모든 테마에서 보이는 헤어라인). hero·첫 블록엔 상단 보더 없음
            style={{
              ...(hasDivider ? { borderTopColor: mt.cardBorder } : {}),
              ...(block.id === highlightedBlockId
                ? { boxShadow: `0 0 0 2px ${mt.accent}` }
                : {}),
            }}
          >
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
      </div>

      <footer
        className="border-t"
        style={{
          backgroundColor: mt.footerBg,
          color: mt.footerText,
          borderColor: mt.cardBorder,
        }}
      >
        <div className="max-w-[1100px] mx-auto px-6 md:px-8 py-10 flex items-center justify-between gap-4 text-sm">
          <span>포지로 만든 포트폴리오</span>
          <a
            href="#top"
            className="font-semibold hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 print:hidden"
            style={{ color: mt.text, outlineColor: mt.accent }}
          >
            맨 위로 ↑
          </a>
        </div>
      </footer>

      {!isExporting && slug && (
        <PdfExportButton
          slug={slug}
          isPending={isExportPending}
          error={exportError}
          onExport={handlePdfExport}
          theme={mt}
        />
      )}
    </div>
  );
}

function PdfExportButton({ slug, isPending, error, onExport, theme }: PdfExportButtonProps) {
  return (
    <div className={EXPORT_BUTTON_CONTAINER_CLASS}>
      {error && (
        <p
          role="alert"
          className="mb-2 max-w-[260px] ml-auto text-right text-xs font-semibold rounded-lg px-3 py-2 shadow-lg"
          // 솔리드 danger 배경 + 흰 텍스트 — 흰 위 #DC2626 ≈4.9:1, 전 테마 cardBg 무관하게 AA 보장
          // (기존 #F3727F 텍스트는 라이트 테마 흰 cardBg 위 2.6:1로 미달)
          style={{ backgroundColor: "#DC2626", color: "#FFFFFF" }}
        >
          {error}
        </p>
      )}
      <button
        onClick={() => onExport(slug)}
        disabled={isPending}
        className={EXPORT_BUTTON_CLASS}
        style={{
          backgroundColor: theme.cardBg,
          color: theme.text,
          borderColor: theme.cardBorder,
          outlineColor: theme.accent,
        }}
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

function getExportStyles(cardBgColor: string): string {
  // 폰트는 next/font 자가호스팅 — PDF(헤드리스 Chromium)도 실제 페이지를 로드하므로 @import 불필요
  return `
    @media print {
      * { 
        -webkit-print-color-adjust: exact !important; 
        color-adjust: exact !important; 
      }
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
