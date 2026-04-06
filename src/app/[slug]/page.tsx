import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import PortfolioPreview from '@/preview/PortfolioPreview'
import AnalyticsTracker from '@/components/AnalyticsTracker'
import { resolveTheme } from '@/preview/themes'
import type { Metadata } from 'next'
import Link from 'next/link'

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

  const host = process.env.NEXT_PUBLIC_APP_URL || 'https://portfolioforge.app'
  const ogImageUrl = `${host}/api/og?slug=${slug}`
  const canonicalUrl = host.includes('localhost') 
    ? `http://${slug}.localhost:3000` 
    : `https://${slug}.portfolioforge.app`

  return {
    title: portfolio.seo_title || portfolio.title || `${portfolio.user.name || slug}'s Portfolio`,
    description: portfolio.seo_description || 'PortfolioForge로 생성된 프리미엄 포트폴리오입니다.',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: portfolio.seo_title || portfolio.title || `${portfolio.user.name || slug}'s Portfolio`,
      description: portfolio.seo_description || 'PortfolioForge로 생성된 프리미엄 포트폴리오입니다.',
      url: `${host}/${slug}`,
      siteName: 'PortfolioForge',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: "summary_large_image",
      title: portfolio.seo_title || portfolio.title || `${portfolio.user.name || slug}'s Portfolio`,
      description: portfolio.seo_description || 'PortfolioForge로 생성된 프리미엄 포트폴리오입니다.',
      images: [ogImageUrl],
    }
  }
}

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params

  const portfolio = await prisma.portfolio.findUnique({
    where: { slug }
  })

  if (!portfolio || !portfolio.is_published) {
    notFound()
  }

  const blocks = await prisma.portfolioBlock.findMany({
    where: { 
      portfolio_id: portfolio.id,
      is_visible: true,
    },
    orderBy: { position: 'asc' }
  });

  const populatedBlocks = await Promise.all(blocks.map(async (block) => {
    const config = block.config as any;
    if (block.block_type === 'project_grid' && config.project_ids?.length) {
      const projectsData = await prisma.rawProject.findMany({
        where: { id: { in: config.project_ids } }
      });
      config.projectsData = config.project_ids.map((id: string) => projectsData.find(p => p.id === id)).filter(Boolean);
    }
    
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

  const t = resolveTheme(portfolio.theme);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: t.bg,
        color: t.text,
        backgroundImage: t.pageBgGradient || "none",
      }}
    >
      <AnalyticsTracker portfolioId={portfolio.id} />
      
      <main className="flex-1 w-full">
        <PortfolioPreview 
          blocks={populatedBlocks} 
          theme={portfolio.theme} 
          designTokens={portfolio.design_tokens}
        />
      </main>

      <footer
        className="py-10 px-6"
        style={{ backgroundColor: t.footerBg }}
      >
        <div className="max-w-[960px] mx-auto flex flex-col items-center gap-3 text-center">
          <p
            className="text-[13px] font-medium"
            style={{ color: t.footerText }}
          >
            © {new Date().getFullYear()} {portfolio.title || slug}
          </p>
          <Link
            href="/"
            className="text-[11px] font-bold uppercase tracking-[2px] transition-colors duration-200 hover:opacity-70"
            style={{ color: t.textMuted }}
          >
            Powered by PortfolioForge
          </Link>
        </div>
      </footer>
    </div>
  )
}
