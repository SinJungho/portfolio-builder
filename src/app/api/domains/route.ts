import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { portfolioService } from '@/services/portfolio';
import { domainService } from '@/services/domain';
import { prisma } from '@/lib/prisma';
import { apiError, logRouteWarning, routeError } from '@/lib/api/errors';
import { normalizeCustomDomain } from '@/lib/domain';

/**
 * 도메인 등록/삭제 엔드포인트
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", 401);
  }

  try {
    const body = await req.json().catch(() => null) as { portfolioId?: unknown; domain?: unknown } | null;
    const portfolioId = typeof body?.portfolioId === 'string' ? body.portfolioId : '';
    const domain = typeof body?.domain === 'string' ? normalizeCustomDomain(body.domain) : null;

    if (!portfolioId || !domain) {
      return apiError("DOMAIN_INVALID", 400);
    }

    // 포트폴리오 소유권을 확인한다.
    const portfolio = await portfolioService.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== session.user.id) {
      return apiError("FORBIDDEN", 403);
    }

    if (portfolio.custom_domain === domain) {
      return NextResponse.json({ success: true, domain });
    }

    const conflict = await prisma.portfolio.findFirst({
      where: { custom_domain: domain, id: { not: portfolioId } },
      select: { id: true },
    });
    if (conflict) return apiError("CONFLICT", 409);

    // Vercel 연동이 없으면 도메인만 저장하고 수동 DNS 안내로 넘긴다.
    // 실제 API 호출 실패만 저장 실패로 취급한다.
    const isManualOnly = !domainService.isConfigured();
    if (!isManualOnly) {
      try {
        await domainService.addDomain(domain);
      } catch (vercelError) {
        logRouteWarning('/api/domains', 'POST', vercelError, 'Vercel domain registration failed');
        return apiError("DOMAIN_SAVE_FAILED", 503);
      }
    }

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { custom_domain: domain },
    });

    return NextResponse.json({ success: true, domain, isManualOnly });
  } catch (error) {
    return routeError('/api/domains', 'POST', error);
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", 401);
  }

  try {
    const body = await req.json().catch(() => null) as { portfolioId?: unknown } | null;
    const portfolioId = typeof body?.portfolioId === 'string' ? body.portfolioId : '';

    if (!portfolioId) {
      return apiError("DOMAIN_REQUIRED", 400);
    }

    const portfolio = await portfolioService.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== session.user.id) {
      return apiError("FORBIDDEN", 403);
    }

    if (portfolio.custom_domain) {
      // 외부 삭제 실패와 무관하게 DB 연결은 제거한다.
      try {
        await domainService.removeDomain(portfolio.custom_domain);
      } catch (vercelError) {
        logRouteWarning('/api/domains', 'DELETE', vercelError, 'Vercel domain removal failed');
      }

      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { custom_domain: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return routeError('/api/domains', 'DELETE', error);
  }
}
