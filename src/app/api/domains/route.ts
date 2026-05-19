import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { portfolioService } from '@/services/portfolio';
import { domainService } from '@/services/domain';
import { prisma } from '@/lib/prisma';

/**
 * 도메인 등록/삭제 엔드포인트
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
  }

  try {
    const { portfolioId, domain } = await req.json();

    if (!portfolioId || !domain) {
      return NextResponse.json({ error: '필수 필드가 누락되었습니다.' }, { status: 400 });
    }

    // 1. 소유권 검증 (PortfolioForge MVP 원칙)
    const portfolio = await portfolioService.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    // 2. Vercel API 호출하여 도메인 추가 (실패 시 예외 처리 후 DB 반영 우회)
    let isManualOnly = false;
    try {
      await domainService.addDomain(domain);
    } catch (vercelError) {
      console.warn('[VERCEL_DOMAIN_WARNING] Vercel에 도메인을 등록하지 못했습니다. 수동 설정 구성으로 대체합니다.', vercelError);
      isManualOnly = true;
    }

    // 3. DB 업데이트 (Vercel API가 실패하더라도 DB에는 저장하여 수동 매핑 가이드 진행 지원)
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { custom_domain: domain },
    });

    return NextResponse.json({ success: true, domain, isManualOnly });
  } catch (error) {
    console.error('도메인 추가 실패:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: '인증되지 않은 요청입니다.' }, { status: 401 });
  }

  try {
    const { portfolioId } = await req.json();

    if (!portfolioId) {
      return NextResponse.json({ error: '포트폴리오 ID가 누락되었습니다.' }, { status: 400 });
    }

    // 1. 소유권 검증
    const portfolio = await portfolioService.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== session.user.id) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    if (portfolio.custom_domain) {
      // 2. Vercel API 호출하여 도메인 삭제 (실패해도 무시하고 DB는 정상 삭제 처리)
      try {
        await domainService.removeDomain(portfolio.custom_domain);
      } catch (vercelError) {
        console.warn('[VERCEL_DOMAIN_WARNING] Vercel에서 도메인을 제거하지 못했습니다.', vercelError);
      }

      // 3. DB 업데이트
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { custom_domain: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('도메인 제거 실패:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : '서버 내부 오류가 발생했습니다.' }, { status: 500 });
  }
}
