import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { DesignTokenSchema } from "@/schemas/portfolio";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    // 1. 입력 데이터 검증 (design_tokens 필드 내부 값 검증)
    const validation = DesignTokenSchema.safeParse(body.design_tokens);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid design tokens", details: validation.error.format() },
        { status: 400 }
      );
    }

    // 2. 포트폴리오 소유권 확인 및 업데이트
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      select: { user_id: true, slug: true },
    });

    if (!portfolio || portfolio.user_id !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        design_tokens: body.design_tokens,
        updated_at: new Date(),
      },
    });

    // 3. 실시간 배포 페이지 캐시 무효화 (On-demand Revalidation)
    if (portfolio.slug) {
      revalidatePath(`/${portfolio.slug}`);
      revalidatePath(`/dashboard`);
    }

    return NextResponse.json(updatedPortfolio);
  } catch (error) {
    console.error("[PORTFOLIO_TOKENS_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
