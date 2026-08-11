import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { rssService } from '@/services/rss';
import { prisma } from '@/lib/prisma';
import { apiError, logRouteWarning, routeError } from '@/lib/api/errors';
import { z } from 'zod';

const connectSchema = z.object({ url: z.string().url().max(2048) });
const disconnectSchema = z.object({ integrationId: z.string().uuid() });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401);
    }

    const parsed = connectSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) {
      return apiError("RSS_INVALID_URL", 400);
    }
    const { url } = parsed.data;

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

    const parsed = disconnectSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return apiError("INVALID_REQUEST", 400);

    const integration = await prisma.integration.findUnique({
      where: { id: parsed.data.integrationId },
    });

    if (!integration || integration.user_id !== session.user.id) {
      return apiError("INTEGRATION_NOT_FOUND", 404);
    }

    await prisma.integration.delete({ where: { id: integration.id } });
    return NextResponse.json({ success: true, message: 'Integration disconnected successfully' });
  } catch (error: unknown) {
    return routeError('/api/integrations/rss', 'DELETE', error);
  }
}
