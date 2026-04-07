'use client'

import HeroBlock from './HeroBlock'
import ProjectGridBlock from './ProjectGridBlock'
import SkillsBlock from './SkillsBlock'
import BlogFeedBlock from './BlogFeedBlock'
import ContactBlock from './ContactBlock'

interface Block {
  id: string
  block_type: string
  config: Record<string, unknown>
  position: number
}

interface RendererProject {
  id: string;
  name: string;
  description: string | null;
  html_url: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  ai_summary: string | null;
  [key: string]: unknown;
}

interface BlockRendererProps {
  blocks: Block[]
  projectsData?: RendererProject[]
  tokens?: {
    primaryColor?: string
    fontFamily?: string
  }
}

export default function BlockRenderer({ blocks, projectsData, tokens }: BlockRendererProps) {
  // position 별로 정렬
  const sortedBlocks = [...blocks].sort((a, b) => a.position - b.position)

  const primaryColor = tokens?.primaryColor || '#3182F6'

  return (
    <div 
      className="flex flex-col w-full"
      style={{ '--primary': primaryColor } as React.CSSProperties}
    >
      {sortedBlocks.map((block) => {
        switch (block.block_type) {
          case 'hero':
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return <HeroBlock key={block.id} config={block.config as any} />
          case 'project_grid':
            // project_grid 블록에 필요한 프로젝트 데이터 필터링
            const targetProjects = projectsData?.filter((p) => 
               (block.config.project_ids as string[]).includes(p.id)
            ) || []
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return <ProjectGridBlock key={block.id} config={block.config as any} projects={targetProjects as any} />
          case 'skills':
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return <SkillsBlock key={block.id} config={block.config as any} />
          case 'blog_feed':
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return <BlogFeedBlock key={block.id} config={block.config as any} />
          case 'contact':
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            return <ContactBlock key={block.id} config={block.config as any} />
          default:
            return null
        }
      })}
    </div>
  )
}
