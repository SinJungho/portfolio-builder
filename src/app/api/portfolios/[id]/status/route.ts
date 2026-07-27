import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { getMissingPortfolioReadiness, isPortfolioReady } from "@/lib/portfolio-readiness";

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { id } = await props.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        is_published: true,
        slug: true,
      },
    });

    if (!portfolio || portfolio.user_id !== session.user.id) {
      return new NextResponse(null, { status: 404 });
    }

    const blocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id },
      select: { block_type: true, is_visible: true, config: true },
    });
    const readinessBlocks = blocks.map((block) => ({
      ...block,
      config: block.config as Record<string, unknown>,
    }));

    return NextResponse.json({
      is_published: portfolio.is_published,
      published_url: portfolio.slug ? `/${portfolio.slug}` : null,
      is_ready: isPortfolioReady(readinessBlocks),
      missing_items: getMissingPortfolioReadiness(readinessBlocks),
    });
  } catch (error: unknown) {
    console.error("GET /api/portfolios/[id]/status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
