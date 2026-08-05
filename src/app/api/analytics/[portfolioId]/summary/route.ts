import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { analyticsService } from '@/services/analytics';
import { apiError, routeError } from '@/lib/api/errors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ portfolioId: string }> }
) {
  try {
    // 세션을 확인한다.
    const session = await auth();
    if (!session || !session.user?.id) {
      return apiError("UNAUTHORIZED", 401);
    }

    const { portfolioId } = await params;
    const url = new NextRequest(req.url);
    const period = (url.nextUrl.searchParams.get('period') as '7d' | '30d' | '90d') || '7d';

    // 서비스에서 소유권을 확인하고 요약을 조회한다.
    try {
      const summary = await analyticsService.getSummary(portfolioId, session.user.id, period);
      return NextResponse.json(summary);
    } catch (e: unknown) {
      if ((e as Error).message === 'FORBIDDEN') {
        return apiError("FORBIDDEN", 403);
      }
      throw e;
    }
  } catch (error) {
    return routeError('/api/analytics/[portfolioId]/summary', 'GET', error);
  }
}
