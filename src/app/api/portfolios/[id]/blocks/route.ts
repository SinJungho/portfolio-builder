import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const reorderBlocksSchema = z.object({
  blocks: z.array(z.object({
    id: z.string(),
    position: z.number(),
  })),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    let json = {};
    try {
      json = await req.json();
    } catch (e) {
      // ignore
    }

    const { success, data, error: zError } = reorderBlocksSchema.safeParse(json);
    if (!success) {
      return NextResponse.json({ error: zError.message }, { status: 400 });
    }

    const existingBlocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id },
      select: { id: true },
    });

    const validBlockIds = new Set(existingBlocks.map(b => b.id));
    for (const b of data.blocks) {
      if (!validBlockIds.has(b.id)) {
        return NextResponse.json({ error: `Block ${b.id} does not belong to this portfolio` }, { status: 400 });
      }
    }

    await prisma.$transaction(
      data.blocks.map((block) => 
        prisma.portfolioBlock.update({
          where: { id: block.id },
          data: { position: block.position },
        })
      )
    );

    if (portfolio?.slug) {
      revalidatePath(`/${portfolio.slug}`);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error: any) {
    console.error("PUT /api/portfolios/[id]/blocks error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
