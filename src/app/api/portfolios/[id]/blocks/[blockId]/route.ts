import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
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
    } catch {
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

    const updateData: Record<string, unknown> = {};
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;
    if (data.config !== undefined) updateData.config = data.config;

    const updatedBlock = await prisma.portfolioBlock.update({
      where: { id: blockId },
      data: updateData,
    });

    if (portfolio?.slug) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: JSON.stringify({ slug: portfolio.slug }),
        });
      } catch (e) {
        console.error("Revalidate explicitly failed:", e);
      }
    }

    return NextResponse.json({ block: updatedBlock }, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH /api/portfolios/[id]/blocks/[blockId] error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    const block = await prisma.portfolioBlock.findFirst({
      where: {
        id: blockId,
        portfolio_id: id,
      },
    });

    if (!block) {
      return new NextResponse(null, { status: 404 });
    }

    await prisma.portfolioBlock.delete({
      where: { id: blockId },
    });

    // Reorder remaining blocks
    const remainingBlocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id },
      orderBy: { position: "asc" },
    });

    for (let i = 0; i < remainingBlocks.length; i++) {
      await prisma.portfolioBlock.update({
        where: { id: remainingBlocks[i].id },
        data: { position: i },
      });
    }

    if (portfolio?.slug) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: JSON.stringify({ slug: portfolio.slug }),
        });
      } catch (e) {
        console.error("Revalidate explicitly failed:", e);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    console.error("DELETE /api/portfolios/[id]/blocks/[blockId] error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
