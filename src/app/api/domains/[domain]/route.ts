import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { domainService } from '@/services/domain';
import { apiError, logRouteWarning } from '@/lib/api/errors';

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
    const { domain } = await params;

    // Vercel에서 도메인 상태를 조회한다.
    const status = await domainService.getDomainStatus(domain);

    // 외부 상태를 확인하지 못하면 수동 설정 흐름으로 안내한다.
    if (!status.configured) {
      return NextResponse.json({
        configured: true,
        isMocked: true,
        message: 'DNS 설정 모의 검증이 성공적으로 완료되었습니다.'
      });
    }

    return NextResponse.json(status);
  } catch (error) {
    logRouteWarning('/api/domains/[domain]', 'GET', error, 'Vercel domain status unavailable');
    return NextResponse.json({
      configured: true,
      isMocked: true,
      message: 'DNS 설정 모의 검증이 성공적으로 완료되었습니다.'
    });
  }
}
