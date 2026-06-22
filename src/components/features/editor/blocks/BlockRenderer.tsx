"use client";

import { type Block } from "@/stores/portfolioStore";
import { type RawProject } from "@/types/project";
import BlogFeedBlock from "./BlogFeedBlock";
import ContactBlock from "./ContactBlock";
import HeroBlock from "./HeroBlock";
import ProjectGridBlock from "./ProjectGridBlock";
import SkillsBlock from "./SkillsBlock";

interface BlockRendererProps {
  blocks: Block[];
  projectsData?: RawProject[];
  tokens?: {
    primaryColor?: string;
    fontFamily?: string;
  };
}

const renderBlock = (
  block: Block,
  projectsData?: RawProject[],
): React.ReactNode => {
  switch (block.block_type) {
    case "hero":
      return (
        <HeroBlock
          key={block.id}
          config={
            block.config as React.ComponentProps<typeof HeroBlock>["config"]
          }
        />
      );
    case "project_grid": {
      // project_grid 블록에 필요한 프로젝트 데이터 필터링
      const targetProjects =
        projectsData?.filter((p) =>
          (block.config as { project_ids: string[] }).project_ids?.includes(
            p.id,
          ),
        ) || [];
      return (
        <ProjectGridBlock
          key={block.id}
          config={
            block.config as React.ComponentProps<
              typeof ProjectGridBlock
            >["config"]
          }
          projects={targetProjects}
        />
      );
    }
    case "skills":
      return (
        <SkillsBlock
          key={block.id}
          config={
            block.config as React.ComponentProps<typeof SkillsBlock>["config"]
          }
        />
      );
    case "blog_feed":
      return (
        <BlogFeedBlock
          key={block.id}
          config={
            block.config as React.ComponentProps<typeof BlogFeedBlock>["config"]
          }
        />
      );
    case "contact":
      return (
        <ContactBlock
          key={block.id}
          config={
            block.config as React.ComponentProps<typeof ContactBlock>["config"]
          }
        />
      );
    default:
      return null;
  }
};

export default function BlockRenderer({
  blocks,
  projectsData,
  tokens,
}: BlockRendererProps) {
  // position 별로 정렬
  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position);

  const primaryColor = tokens?.primaryColor || "#3182F6";

  return (
    <section
      className="flex flex-col w-full"
      style={{ "--primary": primaryColor } as React.CSSProperties}
      aria-label="포트폴리오 콘텐츠"
    >
      {sortedBlocks.map((block) => renderBlock(block, projectsData))}
    </section>
  );
}
