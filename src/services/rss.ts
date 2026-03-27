import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description', 'pubDate'],
  },
});

export class RssService {
  /**
   * Determine provider from URL
   */
  getProviderFromUrl(url: string): string {
    if (url.includes('tistory.com')) return 'tistory';
    if (url.includes('velog.io')) return 'velog';
    if (url.includes('medium.com')) return 'medium';
    return 'custom_rss';
  }

  /**
   * Parse a given RSS Feed URL
   */
  async parseFeed(feedUrl: string) {
    try {
      const feed = await parser.parseURL(feedUrl);
      return feed;
    } catch (error) {
      console.error('Failed to parse RSS feed:', error);
      throw new Error('Invalid RSS feed URL or unreachable feed.');
    }
  }

  /**
   * Add or update an RSS Integration for a user
   */
  async upsertIntegration(userId: string, feedUrl: string) {
    const provider = this.getProviderFromUrl(feedUrl);
    
    // We store the feed URL in `metadata` since `access_token` is for OAuth usually
    return prisma.integration.upsert({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: provider,
        },
      },
      update: {
        metadata: { feedUrl },
        is_active: true,
      },
      create: {
        user_id: userId,
        provider,
        metadata: { feedUrl },
        is_active: true,
      },
    });
  }

  /**
   * Fetch and sync items for an integration
   */
  async syncFeedItems(integrationId: string, userId: string) {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || !integration.is_active || !integration.metadata) {
      throw new Error('Integration inactive or invalid');
    }

    const metadata = integration.metadata as { feedUrl?: string };
    const feedUrl = metadata.feedUrl;

    if (!feedUrl) {
      throw new Error('No feed URL configured');
    }

    const feed = await this.parseFeed(feedUrl);

    let syncedCount = 0;

    for (const item of feed.items) {
      if (!item.title || !item.link) continue;

      const publishedAt = item.pubDate ? new Date(item.pubDate) : new Date();

      const existing = await prisma.feedItem.findFirst({
        where: {
          integration_id: integrationId,
          url: item.link,
        },
      });

      if (existing) {
        await prisma.feedItem.update({
          where: { id: existing.id },
          data: {
            title: item.title,
            published_at: publishedAt,
            metadata: {
              contentSnippet: item.contentSnippet,
              categories: item.categories || [],
            },
          },
        });
      } else {
        await prisma.feedItem.create({
          data: {
            user_id: userId,
            integration_id: integrationId,
            item_type: 'blog_post',
            title: item.title,
            url: item.link,
            published_at: publishedAt,
            metadata: {
              contentSnippet: item.contentSnippet,
              categories: item.categories || [],
            },
          },
        });
        syncedCount++;
      }
    }

    await prisma.integration.update({
      where: { id: integrationId },
      data: { synced_at: new Date() },
    });

    return { syncedCount, totalItems: feed.items.length };
  }
}

export const rssService = new RssService();
