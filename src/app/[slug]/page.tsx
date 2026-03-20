import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PortfolioPreview from '@/preview/PortfolioPreview'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import type { Metadata } from 'next'

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug },
    include: {
      user: true,
    }
  })

  if (!portfolio || !portfolio.is_published) return {}

  return {
    title: portfolio.seo_title || portfolio.title || `${portfolio.user.name || slug}'s Portfolio`,
    description: portfolio.seo_description || 'PortfolioForge로 생성된 프리미엄 포트폴리오입니다.',
    openGraph: {
      images: portfolio.og_image_url ? [portfolio.og_image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
    }
  }
}

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params

  // 1. 포트폴리오 및 블록 매핑 조회
  const portfolio = await prisma.portfolio.findUnique({
    where: { slug }
  })

  // is_published: false면 notFound() 반환
  if (!portfolio || !portfolio.is_published) {
    notFound()
  }

  // 블록 데이터 (is_visible: true 필터, position 기준 asc)
  const blocks = await prisma.portfolioBlock.findMany({
    where: { 
      portfolio_id: portfolio.id,
      is_visible: true,
    },
    orderBy: { position: 'asc' }
  });

  // 2. 프로젝트 블록 데이터 등 사전 패치 (옵션)
  // 현재 MVP에서는 ProjectGrid가 클라이언트 단이 아닌 RSC인 경우 바로 projectsData를 주입 가능
  // PortfolioPreview에서 활용하도록 블록 config에 주입해줍니다.
  const populatedBlocks = await Promise.all(blocks.map(async (block) => {
    const config = block.config as any;
    if (block.block_type === 'project_grid' && config.project_ids?.length) {
      const projectsData = await prisma.rawProject.findMany({
        where: { id: { in: config.project_ids } }
      });
      // 정렬순서 유지
      config.projectsData = config.project_ids.map((id: string) => projectsData.find(p => p.id === id)).filter(Boolean);
    }
    
    // Blog 피드 데이터 프리패치
    if (block.block_type === 'blog_feed') {
      const feedItems = await prisma.feedItem.findMany({
         where: { 
            user_id: portfolio.user_id, 
            integration: { provider: config.integration_provider } 
         },
         orderBy: { published_at: 'desc' },
         take: config.max_items || 4
      });
      config.feed_items = feedItems;
    }

    return {
      ...block,
      config
    };
  }));

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Analytics 트래킹 컴포넌트 */}
      <AnalyticsTracker portfolioId={portfolio.id} />
      
      <main className="flex-1 w-full">
        {/* 공통 뷰어 컴포넌트 사용 */}
        <PortfolioPreview 
          blocks={populatedBlocks} 
          theme={portfolio.theme} 
          designTokens={portfolio.design_tokens}
        />
      </main>

      <footer className="py-12 px-6">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {portfolio.title || slug}. All rights reserved.
          </p>
          <a href="/" target="_blank" className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-widest hover:text-primary transition-colors">
            <span>Powered by</span>
            <span className="font-bold">PortfolioForge</span>
          </a>
        </div>
      </footer>
    </div>
  )
}
