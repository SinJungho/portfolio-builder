import { NextResponse } from "next/server";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { domainService } from "@/services/domain";

/**
 * 도메인 연결 상태 및 DNS 가이드 조회 (GET)
 */
export async function GET(req: Request) {
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

    // 2. Vercel API 상태 조회
    const status = await domainService.getDomainStatus(domain);

    return NextResponse.json({
      success: true,
      ...status,
    });
  } catch (error) {
    console.error("GET /api/domains/status error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "도메인 상태조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
