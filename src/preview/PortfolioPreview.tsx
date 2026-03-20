import React from "react";
import HeroBlock from "./blocks/HeroBlock";
import ProjectGridBlock from "./blocks/ProjectGridBlock";
import SkillsBlock from "./blocks/SkillsBlock";
import ContactBlock from "./blocks/ContactBlock";
import BlogFeedBlock from "./blocks/BlogFeedBlock";

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
  // 간단한 테마 기반 CSS 변수 적용
  const themeClasses: Record<string, string> = {
    minimalist: "bg-white text-gray-900 border-gray-200",
    creative: "bg-gradient-to-br from-indigo-50 via-white to-cyan-50 text-slate-800",
    corporate: "bg-slate-50 text-slate-900",
    dark: "bg-zinc-950 text-zinc-50 border-zinc-800",
    pastel: "bg-rose-50 text-rose-900",
    tech: "bg-[#0d1117] text-[#c9d1d9] font-mono",
  };

  const currentThemeClass = themeClasses[theme] || themeClasses.minimalist;

  const visibleBlocks = blocks
    .filter((b) => b.is_visible)
    .sort((a, b) => a.position - b.position);

  return (
    <div className={`min-h-screen w-full font-sans transition-colors duration-300 ${currentThemeClass}`}>
      <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col gap-20">
        {visibleBlocks.map((block) => {
          switch (block.block_type) {
            case "hero":
              return <HeroBlock key={block.id} config={block.config} />;
            case "project_grid":
              return <ProjectGridBlock key={block.id} config={block.config} />;
            case "skills":
              return <SkillsBlock key={block.id} config={block.config} />;
            case "contact":
              return <ContactBlock key={block.id} config={block.config} />;
            case "blog_feed":
              return <BlogFeedBlock key={block.id} config={block.config} />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
