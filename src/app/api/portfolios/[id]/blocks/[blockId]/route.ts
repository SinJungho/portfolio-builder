import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const updateBlockSchema = z.object({
  is_visible: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    let json = {};
    try {
      json = await req.json();
    } catch (e) {
      // ignore
    }

    const { success, data, error: zError } = updateBlockSchema.safeParse(json);
    if (!success) {
      return NextResponse.json({ error: zError.message }, { status: 400 });
    }

    const block = await prisma.portfolioBlock.findFirst({
      where: {
        id: blockId,
        portfolio_id: id,
      },
    });

    if (!block) {
      return new NextResponse(null, { status: 404 });
    }

    const updateData: any = {};
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;
    if (data.config !== undefined) updateData.config = data.config;

    const updatedBlock = await prisma.portfolioBlock.update({
      where: { id: blockId },
      data: updateData,
    });

    if (portfolio?.slug) {
      revalidatePath(`/${portfolio.slug}`);
    }

    return NextResponse.json({ block: updatedBlock }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/portfolios/[id]/blocks/[blockId] error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
