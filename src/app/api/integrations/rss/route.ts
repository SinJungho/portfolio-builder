import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { rssService } from '@/services/rss';
import { prisma } from '@/lib/prisma';
import { apiError, logRouteWarning, routeError } from '@/lib/api/errors';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401);
    }

    const body = await req.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return apiError("RSS_INVALID_URL", 400);
    }

    try {
      await rssService.parseFeed(url);
    } catch (error: unknown) {
      logRouteWarning('/api/integrations/rss', 'POST', error, 'RSS parsing failed');
      return apiError("RSS_PARSE_FAILED", 400);
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
    return routeError('/api/integrations/rss', 'POST', error);
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401);
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
    return routeError('/api/integrations/rss', 'GET', error);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401);
    }

    let integrationId: string | undefined;
    try {
      const body = await req.json();
      integrationId = body.integrationId;
    } catch (error) {
      logRouteWarning('/api/integrations/rss', 'DELETE', error, 'Invalid JSON');
    }

    if (integrationId) {
      // 지정한 연동을 삭제한다.
      const integration = await prisma.integration.findUnique({
        where: { id: integrationId },
      });

      if (!integration || integration.user_id !== session.user.id) {
        return apiError("INTEGRATION_NOT_FOUND", 403);
      }

      await prisma.integration.delete({
        where: { id: integrationId },
      });

      return NextResponse.json({ success: true, message: 'Integration disconnected successfully' });
    } else {
      // 사용자의 모든 RSS 연동을 삭제한다.
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
    return routeError('/api/integrations/rss', 'DELETE', error);
  }
}
