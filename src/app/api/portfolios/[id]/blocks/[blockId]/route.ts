import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { apiError, logRouteError, logRouteWarning, routeError } from "@/lib/api/errors";
import { z } from "zod";
import { BlockConfigSchema } from "@/schemas/portfolio";

const updateBlockSchema = z.object({
  is_visible: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),
}).refine((value) => value.is_visible !== undefined || value.config !== undefined);

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  try {
    const { id, blockId } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    const json = await req.json().catch((error: unknown) => {
      logRouteWarning('/api/portfolios/[id]/blocks/[blockId]', 'PATCH', error, 'Invalid JSON');
      return {};
    });

    const { success, data } = updateBlockSchema.safeParse(json);
    if (!success) {
      return apiError("INVALID_REQUEST", 400);
    }

    const block = await prisma.portfolioBlock.findFirst({
      where: {
        id: blockId,
        portfolio_id: id,
      },
    });

    if (!block) {
      return apiError("BLOCK_NOT_FOUND", 404);
    }

    const updateData: Record<string, unknown> = {};
    if (data.is_visible !== undefined) updateData.is_visible = data.is_visible;
    if (data.config !== undefined) {
      const currentConfig = block.config && typeof block.config === "object" && !Array.isArray(block.config)
        ? block.config as Record<string, unknown>
        : {};
      const mergedConfig = { ...currentConfig, ...data.config };
      const parsedConfig = BlockConfigSchema.safeParse({
        block_type: block.block_type,
        config: mergedConfig,
      });
      if (!parsedConfig.success) {
        // 어떤 필드가 걸렸는지 남겨야 클라이언트 가드가 어긋났을 때 진단이 된다.
        return apiError("INVALID_REQUEST", 400, {
          issues: parsedConfig.error.issues.map((issue) => issue.path.join(".")),
        });
      }
      updateData.config = parsedConfig.data.config;
    }

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
        logRouteError('/api/revalidate', 'POST', e);
      }
    }

    return NextResponse.json({ block: updatedBlock }, { status: 200 });
  } catch (error: unknown) {
    return routeError('/api/portfolios/[id]/blocks/[blockId]', 'PATCH', error);
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
      return apiError("BLOCK_NOT_FOUND", 404);
    }

    const remainingBlocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id, id: { not: blockId } },
      orderBy: { position: "asc" },
    });
    await prisma.$transaction([
      prisma.portfolioBlock.delete({ where: { id: blockId } }),
      ...remainingBlocks.map((remainingBlock, position) =>
        prisma.portfolioBlock.update({
          where: { id: remainingBlock.id },
          data: { position },
        }),
      ),
    ]);

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
        logRouteError('/api/revalidate', 'POST', e);
      }
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: unknown) {
    return routeError('/api/portfolios/[id]/blocks/[blockId]', 'DELETE', error);
  }
}
