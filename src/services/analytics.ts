import { prisma } from '@/lib/prisma';
import { subDays, format } from 'date-fns';

export interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  dailyStats: { date: string; views: number }[];
  topBlocks: { block_id: string; type: string; count: number }[];
  topReferrers: { referrer: string; count: number }[];
}

export class AnalyticsService {
  /**
   * Get analytics summary for a portfolio
   */
  async getSummary(portfolioId: string, userId: string, period: '7d' | '30d' | '90d' = '7d'): Promise<AnalyticsSummary> {
    // 1. Ownership verify
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      select: { user_id: true }
    });

    if (!portfolio || portfolio.user_id !== userId) {
      throw new Error('FORBIDDEN');
    }

    // 2. Calculate date range
    const days = parseInt(period);
    const startDate = subDays(new Date(), days);

    // 3. Fetch events
    const events = await prisma.analyticsEvent.findMany({
      where: {
        portfolio_id: portfolioId,
        created_at: { gte: startDate }
      },
      orderBy: { created_at: 'asc' }
    });

    // 4. Aggregate data in JS (Efficient enough for MVP scale)
    const dailyViewsMap = new Map<string, number>();
    const blockClickMap = new Map<string, number>();
    const referrerMap = new Map<string, number>();
    const sessions = new Set<string>();
    
    let totalViews = 0;
    let totalClicks = 0;

    // Initialize daily map with 0s to avoid gaps in chart
    for (let i = 0; i < days; i++) {
        const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
        dailyViewsMap.set(dateStr, 0);
    }

    events.forEach(event => {
      const dateStr = format(event.created_at, 'yyyy-MM-dd');
      
      if (event.event_type === 'page_view') {
        totalViews++;
        dailyViewsMap.set(dateStr, (dailyViewsMap.get(dateStr) || 0) + 1);
        if (event.session_id) sessions.add(event.session_id);
      } else if (event.event_type === 'block_click' || event.event_type === 'contact_click') {
        totalClicks++;
        if (event.block_id) {
            blockClickMap.set(event.block_id, (blockClickMap.get(event.block_id) || 0) + 1);
        }
      }

      if (event.referrer) {
        let domain = event.referrer;
        try {
          domain = new URL(event.referrer).hostname;
        } catch { /* ignore parse errors */ }
        referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
      }
    });

    // 5. Format results
    const dailyStats = Array.from(dailyViewsMap.entries())
      .map(([date, views]) => ({ date, views }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // For top blocks, we might need block names, but for now we return IDs
    // The UI can fetch blocks or use block_id to find them in the current portfolio set
    const topBlocks = Array.from(blockClickMap.entries())
      .map(([block_id, count]) => ({ block_id, type: 'block', count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalViews,
      uniqueVisitors: sessions.size,
      totalClicks,
      dailyStats,
      topBlocks,
      topReferrers
    };
  }
}

export const analyticsService = new AnalyticsService();
