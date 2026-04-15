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
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { portfolioId, domain } = await req.json();

    if (!portfolioId || !domain) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 1. 소유권 검증 (PortfolioForge MVP 원칙)
    const portfolio = await portfolioService.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. Vercel API 호출하여 도메인 추가
    await domainService.addDomain(domain);

    // 3. DB 업데이트
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { custom_domain: domain },
    });

    return NextResponse.json({ success: true, domain });
  } catch (error) {
    console.error('Failed to add domain:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { portfolioId } = await req.json();

    if (!portfolioId) {
      return NextResponse.json({ error: 'Missing portfolioId' }, { status: 400 });
    }

    // 1. 소유권 검증
    const portfolio = await portfolioService.findById(portfolioId);
    if (!portfolio || portfolio.user_id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (portfolio.custom_domain) {
      // 2. Vercel API 호출하여 도메인 삭제
      await domainService.removeDomain(portfolio.custom_domain);

      // 3. DB 업데이트
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: { custom_domain: null },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to remove domain:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal Server Error' }, { status: 500 });
  }
}
