import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { analyticsService } from '@/services/analytics';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    const { portfolioId } = await params;
    // 1. Session verify
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const url = new NextRequest(req.url);
    const period = (url.nextUrl.searchParams.get('period') as '7d' | '30d' | '90d') || '7d';

    // 2. Fetch summary (Service handles ownership check)
    try {
      const summary = await analyticsService.getSummary(portfolioId, session.user.id, period);
      return NextResponse.json(summary);
    } catch (e) {
      if (e instanceof Error && e.message === 'FORBIDDEN') {
        return NextResponse.json({ error: 'FORBIDDEN' }, { status: 403 });
      }
      throw e;
    }
  } catch (error) {
    console.error('[ANALYTICS_GET]', error);
    return NextResponse.json({ error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
  }
}
