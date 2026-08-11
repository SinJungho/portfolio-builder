import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { domainService } from '@/services/domain';
import { apiError, logRouteWarning } from '@/lib/api/errors';
import { normalizeCustomDomain } from '@/lib/domain';
import { prisma } from '@/lib/prisma';

/**
 * 도메인의 DNS 설정 상태를 확인한다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", 401);
  }

  try {
    const { domain: rawDomain } = await params;
    const domain = normalizeCustomDomain(rawDomain);
    if (!domain) return apiError("DOMAIN_INVALID", 400);

    const portfolio = await prisma.portfolio.findFirst({
      where: { custom_domain: domain, user_id: session.user.id },
      select: { id: true },
    });
    if (!portfolio) return apiError("NOT_FOUND", 404);

    // Vercel에서 도메인 상태를 조회한다.
    const status = await domainService.getDomainStatus(domain);

    // 외부 상태를 확인하지 못하면 수동 설정 흐름으로 안내한다.
    if ('error' in status) return apiError("DOMAIN_STATUS_FAILED", 503);

    return NextResponse.json(status);
  } catch (error) {
    logRouteWarning('/api/domains/[domain]', 'GET', error, 'Vercel domain status unavailable');
    return apiError("DOMAIN_STATUS_FAILED", 503);
  }
}
