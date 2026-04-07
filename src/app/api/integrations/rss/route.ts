import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { rssService } from '@/services/rss';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Invalid URL provided' }, { status: 400 });
    }

    try {
      await rssService.parseFeed(url);
    } catch (e) {
      return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to parse RSS feed' }, { status: 400 });
    }

    const integration = await rssService.upsertIntegration(session.user.id, url);
    const result = await rssService.syncFeedItems(integration.id, session.user.id);

    return NextResponse.json({
      success: true,
      integration,
      syncedCount: result.syncedCount,
      totalItems: result.totalItems,
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/integrations/rss error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const integrations = await prisma.integration.findMany({
      where: {
        user_id: session.user.id,
        provider: { in: ['tistory', 'velog', 'medium', 'custom_rss'] },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json(integrations);
  } catch (error) {
    console.error('GET /api/integrations/rss error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 });
  }
}
