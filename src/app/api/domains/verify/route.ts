import { NextResponse } from "next/server";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { domainService } from "@/services/domain";
import { verifyDomainSchema } from "@/schemas/domain";

/**
 * 도메인 DNS 검증 트리거 (POST)
 */
export async function POST(req: Request) {
  try {
    const json = await req.json();
    const { success, data, error: zError } = verifyDomainSchema.safeParse(json);

    if (!success) {
      return NextResponse.json({ error: zError.message }, { status: 400 });
    }

    const { portfolio_id, domain } = data;

    // 1. 소유권 확인
    const { error } = await validatePortfolioOwnership(portfolio_id);
    if (error) return error;

    // 2. Vercel API 검증 요청
    const verified = await domainService.verifyDomain(domain);

    return NextResponse.json({ success: true, verified });
  } catch (error) {
    console.error("POST /api/domains/verify error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "도메인 검증 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
