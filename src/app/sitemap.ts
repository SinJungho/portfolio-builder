import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const portfolios = await prisma.portfolio.findMany({
    where: { is_published: true },
    select: {
      slug: true,
      updated_at: true,
    }
  })

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://portfolioforge.app'

  const portfolioUrls = portfolios.map((p) => ({
    url: `${baseUrl.replace('://', `://${p.slug}.`)}`,
    lastModified: p.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...portfolioUrls,
  ]
}
