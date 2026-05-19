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
    } catch (e: unknown) {
      return NextResponse.json({ error: (e as Error).message || 'Failed to parse RSS feed' }, { status: 400 });
    }

    const integration = await rssService.upsertIntegration(session.user.id, url);
    const result = await rssService.syncFeedItems(integration.id, session.user.id);

    return NextResponse.json({
      success: true,
      integration,
      syncedCount: result.syncedCount,
      totalItems: result.totalItems,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('POST /api/integrations/rss error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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
  } catch (error: unknown) {
    console.error('GET /api/integrations/rss error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    let integrationId: string | undefined;
    try {
      const body = await req.json();
      integrationId = body.integrationId;
    } catch (error) {
      console.warn('DELETE /api/integrations/rss: Request body is empty or invalid JSON', error);
    }

    if (integrationId) {
      // 특정 연동 아이디를 기준으로 삭제
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId },
      });

      if (!integration || integration.user_id !== session.user.id) {
        return NextResponse.json({ error: 'unauthorized or not found' }, { status: 403 });
      }

      await prisma.integration.delete({
        where: { id: integrationId },
      });

      return NextResponse.json({ success: true, message: 'Integration disconnected successfully' });
    } else {
      // 모든 블로그 RSS 연동을 일괄 삭제 (모든 RSS 프로바이더)
      const providers = ['tistory', 'velog', 'medium', 'custom_rss'];
      
      await prisma.integration.deleteMany({
        where: {
          user_id: session.user.id,
          provider: { in: providers },
        },
      });

      return NextResponse.json({ success: true, message: 'All RSS integrations disconnected successfully' });
    }
  } catch (error: unknown) {
    console.error('DELETE /api/integrations/rss error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

