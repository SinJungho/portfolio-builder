import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = env.NEXT_PUBLIC_APP_URL || 'https://portfolioforge.app';

  // Fetch all published portfolios
  const portfolios = await prisma.portfolio.findMany({
    where: { is_published: true },
    select: { slug: true, updated_at: true },
  });

  const portfolioUrls = portfolios.map((portfolio) => ({
    url: `${baseUrl}/${portfolio.slug}`,
    lastModified: portfolio.updated_at,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...portfolioUrls,
  ];
}
