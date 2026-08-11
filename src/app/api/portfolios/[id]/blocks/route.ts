import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { apiError, logRouteWarning, routeError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { BlockConfigSchema } from "@/schemas/portfolio";

const reorderBlocksSchema = z.object({
  blocks: z.array(z.object({
    id: z.string().uuid(),
    position: z.number().int().nonnegative(),
  })).max(20),
});

const createBlockSchema = z.object({
  block_type: z.enum(["hero", "project_grid", "skills", "blog_feed", "contact"]),
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    const json = await req.json().catch((error: unknown) => {
      logRouteWarning('/api/portfolios/[id]/blocks', 'PUT', error, 'Invalid JSON');
      return {};
    });

    const { success, data } = reorderBlocksSchema.safeParse(json);
    if (!success) {
      return apiError("INVALID_REQUEST", 400);
    }

    const existingBlocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id },
      select: { id: true },
    });

    const validBlockIds = new Set(existingBlocks.map((block) => block.id));
    const requestedBlockIds = new Set(data.blocks.map((block) => block.id));
    const positions = new Set(data.blocks.map((block) => block.position));
    const hasCompleteBlockSet =
      requestedBlockIds.size === validBlockIds.size &&
      [...validBlockIds].every((blockId) => requestedBlockIds.has(blockId));
    const hasContiguousPositions =
      positions.size === data.blocks.length &&
      data.blocks.every((_, index) => positions.has(index));
    if (!hasCompleteBlockSet || !hasContiguousPositions) {
      return apiError("INVALID_REQUEST", 400);
    }
    for (const block of data.blocks) {
      if (!validBlockIds.has(block.id)) {
        return apiError("BLOCK_NOT_FOUND", 400);
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
  } catch (error: unknown) {
    return routeError("/api/portfolios/[id]/blocks", "PUT", error);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    const parsed = createBlockSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return apiError("INVALID_BLOCK_TYPE", 400);
    const { block_type } = parsed.data;

    const [maxPositionBlock, blockCount] = await Promise.all([
      prisma.portfolioBlock.findFirst({
        where: { portfolio_id: id },
        orderBy: { position: 'desc' },
        select: { position: true }
      }),
      prisma.portfolioBlock.count({ where: { portfolio_id: id } }),
    ]);
    if (blockCount >= 20) return apiError("INVALID_REQUEST", 400);
    
    const nextPosition = maxPositionBlock ? maxPositionBlock.position + 1 : 0;

    let defaultConfig: Prisma.InputJsonObject = {};
    if (block_type === 'hero') {
      const user = await prisma.user.findUnique({
        where: { id: portfolio.user_id },
        select: { name: true, github_login: true, github_bio: true },
      });
      const bio = user?.github_bio?.trim() || "";
      defaultConfig = {
        headline: user?.name || user?.github_login || "포트폴리오",
        subheadline: bio.substring(0, 50),
        bio,
        show_github_stats: true,
      };
    }
    if (block_type === 'project_grid') defaultConfig = { layout: "grid", columns: 2, project_ids: [], show_tech_stack: true };
    if (block_type === 'skills') defaultConfig = { chart_type: "bar", skills: [] };
    if (block_type === 'blog_feed') defaultConfig = { integration_provider: "velog", max_items: 4, show_thumbnail: true };
    if (block_type === 'contact') defaultConfig = { github_url: "", email: "", linkedin_url: "", website_url: "" };

    const validatedConfig = BlockConfigSchema.safeParse({ block_type, config: defaultConfig });
    if (!validatedConfig.success) return apiError("INVALID_REQUEST", 400);

    const newBlock = await prisma.portfolioBlock.create({
      data: {
        portfolio_id: id,
        block_type,
        position: nextPosition,
        config: validatedConfig.data.config,
        is_visible: true,
        is_ai_generated: false,
      }
    });

    if (portfolio?.slug) {
      revalidatePath(`/${portfolio.slug}`);
    }

    return NextResponse.json(newBlock, { status: 201 });
  } catch (error: unknown) {
    return routeError("/api/portfolios/[id]/blocks", "POST", error);
  }
}
