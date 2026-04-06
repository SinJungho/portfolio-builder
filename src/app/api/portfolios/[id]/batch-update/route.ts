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
    const { design_tokens, blocks } = body;

    // 1. 데이터 소유권 확인
    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      select: { user_id: true, slug: true },
    });

    if (!portfolio || portfolio.user_id !== session.user.id) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // 2. 일괄 업데이트 트랜잭션 실행
    await prisma.$transaction(async (tx) => {
      // 2.1 디자인 토큰 업데이트 (검증 포함)
      if (design_tokens) {
        const validation = DesignTokenSchema.safeParse(design_tokens);
        if (validation.success) {
          await tx.portfolio.update({
            where: { id },
            data: { design_tokens: validation.data as any },
          });
        }
      }

      // 2.2 블록 순서 및 가시성 업데이트
      if (blocks && Array.isArray(blocks)) {
        for (const block of blocks) {
          await tx.portfolioBlock.update({
            where: { 
              id: block.id,
              portfolio_id: id // 보안: 해당 포트폴리오에 속한 블록인지 확인
            },
            data: {
              position: block.position,
              is_visible: block.is_visible,
              updated_at: new Date(),
            },
          });
        }
      }
    });

    // 3. 캐시 무효화
    if (portfolio.slug) {
      revalidatePath(`/${portfolio.slug}`);
      revalidatePath(`/dashboard`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PORTFOLIO_BATCH_UPDATE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
