import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BlockRenderer from '@/components/features/editor/blocks/BlockRenderer'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug, is_published: true },
    select: { title: true, seo_title: true, seo_description: true, og_image_url: true }
  })

  if (!portfolio) return {}

  return {
    title: portfolio.seo_title || portfolio.title || `${slug}'s Portfolio`,
    description: portfolio.seo_description || 'PortfolioForge로 생성된 프리미엄 포트폴리오입니다.',
    openGraph: {
      images: portfolio.og_image_url ? [portfolio.og_image_url] : [],
    }
  }
}

export default async function DomainPage({ params }: Props) {
  const { slug } = await params

  // 1. 포트폴리오 및 블록 데이터 조회
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug, is_published: true },
    include: {
      blocks: {
        where: { is_visible: true },
        orderBy: { position: 'asc' }
      }
    }
  })

  if (!portfolio) {
    notFound()
  }

  // 2. 프로젝트 블록이 있을 경우 프로젝트 데이터 병렬 조회
  const projectGridBlock = portfolio.blocks.find(b => b.block_type === 'project_grid')
  let projectsData: any[] = []

  if (projectGridBlock) {
    const projectIds = (projectGridBlock.config as any).project_ids || []
    if (projectIds.length > 0) {
      projectsData = await prisma.rawProject.findMany({
        where: { id: { in: projectIds } }
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Viewer 모드에서는 헤더가 다르게 보일 수 있으므로 필요시 전용 헤더 추가 가능 */}
      <main className="flex-1">
        <BlockRenderer 
          blocks={portfolio.blocks as any} 
          projectsData={projectsData} 
        />
      </main>

      {/* Footer (Powered By) */}
      <footer className="py-12 px-6 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {portfolio.title || slug}. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest">
            <span>Powered by</span>
            <span className="text-primary font-bold">PortfolioForge</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
