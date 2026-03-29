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
  config: any;
  is_visible: boolean;
};

interface PortfolioPreviewProps {
  blocks: Block[];
  theme: string;
  designTokens?: any;
}

export default function PortfolioPreview({ blocks, theme, designTokens }: PortfolioPreviewProps) {
  const t = resolveTheme(theme);

  const visibleBlocks = blocks
    .filter((b) => b.is_visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div
      className="w-full"
      style={{
        backgroundColor: t.bg,
        color: t.text,
        backgroundImage: t.pageBgGradient || "none",
        fontFamily: "'Inter', 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
        scrollBehavior: "smooth",
      }}
    >
      {visibleBlocks.map((block) => {
        // Hero uses full-bleed (no container)
        if (block.block_type === "hero") {
          return (
            <div key={block.id} className="max-w-[1100px] mx-auto px-6 md:px-8">
              <HeroBlock config={block.config} theme={t} />
            </div>
          );
        }

        // Contact is nearly full bleed
        if (block.block_type === "contact") {
          return (
            <div key={block.id} className="max-w-[1100px] mx-auto px-6 md:px-8 py-12 md:py-16">
              <ContactBlock config={block.config} theme={t} />
            </div>
          );
        }

        // All other blocks: contained with generous spacing
        return (
          <div key={block.id} className="max-w-[1100px] mx-auto px-6 md:px-8 py-16 md:py-24">
            {block.block_type === "project_grid" && (
              <ProjectGridBlock config={block.config} theme={t} />
            )}
            {block.block_type === "skills" && (
              <SkillsBlock config={block.config} theme={t} />
            )}
            {block.block_type === "blog_feed" && (
              <BlogFeedBlock config={block.config} theme={t} />
            )}
          </div>
        );
      })}
    </div>
  );
}
