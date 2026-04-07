import { NextResponse } from "next/server";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { prisma } from "@/lib/prisma";
import { domainService } from "@/services/domain";
import { addDomainSchema } from "@/schemas/domain";

/**
 * 프로젝트에 도메인 추가 (POST)
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { success, data, error: zError } = addDomainSchema.safeParse(json);

    if (!success) {
      return NextResponse.json({ error: zError.message }, { status: 400 });
    }

    const { portfolio_id, domain } = data;

    // 1. 소유권 확인
    const { error } = await validatePortfolioOwnership(portfolio_id);
    if (error) return error;

    // 2. Vercel API를 통해 도메인 추가
    const vercelData = await domainService.addDomain(domain);

    // 3. DB 업데이트 (custom_domain 필드)
    await prisma.portfolio.update({
      where: { id: portfolio_id },
      data: { custom_domain: domain },
    });

    return NextResponse.json({
      success: true,
      domain: vercelData.name,
      verified: vercelData.verified,
      verification: vercelData.verification,
    });
  } catch (error) {
    console.error("POST /api/domains error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "도메인 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

/**
 * 도메인 연결 해제 (DELETE)
 */
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const portfolioId = searchParams.get("portfolio_id");
    const domain = searchParams.get("domain");

    if (!portfolioId || !domain) {
      return NextResponse.json(
        { error: "portfolio_id와 domain이 필요합니다." },
        { status: 400 }
      );
    }

    // 1. 소유권 확인
    const { error } = await validatePortfolioOwnership(portfolioId);
    if (error) return error;

    // 2. Vercel API를 통해 도메인 삭제
    await domainService.removeDomain(domain);

    // 3. DB 업데이트 (custom_domain 제거)
    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: { custom_domain: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/domains error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "도메인 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
