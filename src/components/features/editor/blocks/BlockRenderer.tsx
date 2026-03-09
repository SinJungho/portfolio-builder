'use client'

import HeroBlock from './HeroBlock'
import ProjectGridBlock from './ProjectGridBlock'
import SkillsBlock from './SkillsBlock'
import BlogFeedBlock from './BlogFeedBlock'
import ContactBlock from './ContactBlock'

interface Block {
  id: string
  block_type: string
  config: any
  position: number
}

interface BlockRendererProps {
  blocks: Block[]
  projectsData?: any[]
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
            return <HeroBlock key={block.id} config={block.config} />
          case 'project_grid':
            // project_grid 블록에 필요한 프로젝트 데이터 필터링
            const targetProjects = projectsData?.filter(p => 
              block.config.project_ids.includes(p.id)
            ) || []
            return <ProjectGridBlock key={block.id} config={block.config} projects={targetProjects} />
          case 'skills':
            return <SkillsBlock key={block.id} config={block.config} />
          case 'blog_feed':
            return <BlogFeedBlock key={block.id} config={block.config} />
          case 'contact':
            return <ContactBlock key={block.id} config={block.config} />
          default:
            return null
        }
      })}
    </div>
  )
}
