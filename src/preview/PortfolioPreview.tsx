"use client";

import React from "react";
import HeroBlock from "./blocks/HeroBlock";
import ProjectGridBlock from "./blocks/ProjectGridBlock";
import SkillsBlock from "./blocks/SkillsBlock";
import ContactBlock from "./blocks/ContactBlock";
import BlogFeedBlock from "./blocks/BlogFeedBlock";
import { resolveTheme } from "./themes";

type Block = {
  id: string;
  block_type: string;
  position: number;
  config: Record<string, unknown>;
  is_visible: boolean;
};

interface PortfolioPreviewProps {
  blocks: Block[];
  theme: string;
  designTokens?: Record<string, unknown>;
}

export default function PortfolioPreview({ blocks, theme, designTokens }: PortfolioPreviewProps) {
  const baseTheme = resolveTheme(theme);
  
  // 디자인 토큰 병합 로직 (강조색 및 관련 스타일 강제 대체)
  const primaryColor = (designTokens?.primaryColor as string) || baseTheme.accent;
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
    cardRadius: (designTokens?.borderRadius as string) === "none" ? "0px" :
                (designTokens?.borderRadius as string) === "sm" ? "8px" :
                (designTokens?.borderRadius as string) === "md" ? "16px" :
                (designTokens?.borderRadius as string) === "lg" ? "24px" :
                (designTokens?.borderRadius as string) === "full" ? "9999px" : baseTheme.cardRadius
  };

  // 폰트 매핑
  const fontMap: Record<string, string> = {
    inter: "'Inter', sans-serif",
    pretendard: "'Pretendard', sans-serif",
    "fira-code": "'Fira Code', monospace",
    playfair: "'Playfair Display', serif",
  };
  const fontFamily = fontMap[(designTokens?.fontFamily as string) || "inter"] || fontMap.inter;

  // 간격 매핑 (Spacing Mapping - 정석 수치 반영)
  const spacingClassMap = {
    compact: "py-10 md:py-16",
    normal: "py-16 md:py-24",
    relaxed: "py-24 md:py-40",
  };
  const spacingClass = spacingClassMap[(designTokens?.spacing as keyof typeof spacingClassMap)] || spacingClassMap.normal;

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
              <HeroBlock config={block.config as unknown as Parameters<typeof HeroBlock>[0]["config"]} theme={mt} />
            </div>
          );
        }

        // Contact is nearly full bleed
        if (block.block_type === "contact") {
          return (
            <div key={block.id} className={`max-w-[1100px] mx-auto px-6 md:px-8 ${spacingClass}`}>
              <ContactBlock config={block.config as unknown as Parameters<typeof ContactBlock>[0]["config"]} theme={mt} />
            </div>
          );
        }

        // All other blocks: contained with generous spacing
        return (
          <div key={block.id} className={`max-w-[1100px] mx-auto px-6 md:px-8 ${spacingClass}`}>
            {block.block_type === "project_grid" && (
              <ProjectGridBlock config={block.config as unknown as Parameters<typeof ProjectGridBlock>[0]["config"]} theme={mt} />
            )}
            {block.block_type === "skills" && (
              <SkillsBlock config={block.config as unknown as Parameters<typeof SkillsBlock>[0]["config"]} theme={mt} />
            )}
            {block.block_type === "blog_feed" && (
              <BlogFeedBlock config={block.config as unknown as Parameters<typeof BlogFeedBlock>[0]["config"]} theme={mt} />
            )}
          </div>
        );
      })}
    </div>
  );
}
