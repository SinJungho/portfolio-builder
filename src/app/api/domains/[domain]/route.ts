import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { domainService } from '@/services/domain';

/**
 * 도메인 설정 상태 확인 엔드포인트
 * DNS 설정이 올바르게 되었는지 Vercel API를 통해 실시간으로 확인합니다.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ domain: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { domain } = await params;

    // Vercel API를 통해 도메인 구성 정보 조회
    const status = await domainService.getDomainStatus(domain);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to get domain status:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
