import { prisma } from '@/lib/prisma';
import Parser from 'rss-parser';
import dns from 'node:dns';
import { isIP, type LookupFunction } from 'node:net';

export function isPrivateNetworkAddress(address: string): boolean {
  const unwrapped = address.toLowerCase().replace(/^\[|\]$/g, '');
  if (unwrapped.startsWith('::ffff:')) {
    const mappedAddress = unwrapped.slice('::ffff:'.length);
    return isIP(mappedAddress) === 4 ? isPrivateNetworkAddress(mappedAddress) : true;
  }
  const value = unwrapped;
  const version = isIP(value);
  if (version === 0) return false;
  if (version === 4) {
    const [a, b] = value.split('.').map(Number);
    return a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && (b === 0 || b === 168)) ||
      (a === 198 && (b === 18 || b === 19));
  }
  return value === '::' || value === '::1' ||
    /^(?:fc|fd|fe[89ab]|ff)/.test(value) || value.startsWith('2001:db8:');
}

export function validateFeedUrl(feedUrl: string): string {
  const parsed = new URL(feedUrl);
  const hostname = parsed.hostname.toLowerCase();
  const unwrappedHostname = hostname.replace(/^\[|\]$/g, '');
  if (
    !['http:', 'https:'].includes(parsed.protocol) ||
    parsed.username ||
    parsed.password ||
    ['localhost', 'localhost.localdomain'].includes(hostname) ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    isIP(unwrappedHostname) !== 0 ||
    isPrivateNetworkAddress(hostname)
  ) {
    throw new Error('RSS URL must use a public HTTP host');
  }
  return parsed.toString();
}

const publicLookup = ((
  hostname: string,
  options: { family?: number },
  callback: (error: NodeJS.ErrnoException | null, address?: string, family?: number) => void,
) => {
  dns.lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
    if (error) return callback(error);
    if (!addresses.length || addresses.some(({ address }) => isPrivateNetworkAddress(address))) {
      return callback(Object.assign(new Error('RSS host resolves to a private address'), { code: 'EACCES' }));
    }
    const requestedFamily = typeof options === 'object' ? options.family : undefined;
    const selected = addresses.find(({ family }) => !requestedFamily || family === requestedFamily) || addresses[0];
    callback(null, selected.address, selected.family);
  });
}) as LookupFunction;

const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description', 'pubDate'],
  },
  timeout: 10_000,
  maxRedirects: 3,
  headers: { 'User-Agent': 'PortfolioForge RSS Reader' },
  requestOptions: { lookup: publicLookup },
});

export class RssService {
  /**
   * Determine provider from URL
   */
  getProviderFromUrl(url: string): string {
    const hostname = new URL(url).hostname.toLowerCase();
    if (hostname === 'tistory.com' || hostname.endsWith('.tistory.com')) return 'tistory';
    if (hostname === 'velog.io' || hostname.endsWith('.velog.io')) return 'velog';
    if (hostname === 'medium.com' || hostname.endsWith('.medium.com')) return 'medium';
    return 'custom_rss';
  }

  /**
   * Parse a given RSS Feed URL
   */
  async parseFeed(feedUrl: string) {
    try {
      const feed = await parser.parseURL(validateFeedUrl(feedUrl));
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
    const normalizedFeedUrl = validateFeedUrl(feedUrl);
    const provider = this.getProviderFromUrl(normalizedFeedUrl);
    
    // We store the feed URL in `metadata` since `access_token` is for OAuth usually
    return prisma.integration.upsert({
      where: {
        user_id_provider: {
          user_id: userId,
          provider: provider,
        },
      },
      update: {
        metadata: { feedUrl: normalizedFeedUrl },
        is_active: true,
      },
      create: {
        user_id: userId,
        provider,
        metadata: { feedUrl: normalizedFeedUrl },
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

    if (!integration || integration.user_id !== userId || !integration.is_active || !integration.metadata) {
      throw new Error('Integration inactive or invalid');
    }

    const metadata = integration.metadata as { feedUrl?: string };
    const feedUrl = metadata.feedUrl;

    if (!feedUrl) {
      throw new Error('No feed URL configured');
    }

    const feed = await this.parseFeed(feedUrl);

    let syncedCount = 0;

    for (const item of feed.items.slice(0, 100)) {
      if (!item.title || !item.link) continue;

      const candidateDate = item.pubDate ? new Date(item.pubDate) : new Date();
      const publishedAt = Number.isNaN(candidateDate.getTime()) ? new Date() : candidateDate;

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
