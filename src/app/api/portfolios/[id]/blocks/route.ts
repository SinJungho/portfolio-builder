import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { apiError, logRouteWarning, routeError } from "@/lib/api/errors";
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

    const body = await req.json();
    const { block_type } = body;

    if (!["hero", "project_grid", "skills", "blog_feed", "contact"].includes(block_type)) {
      return apiError("INVALID_BLOCK_TYPE", 400);
    }

    const maxPositionBlock = await prisma.portfolioBlock.findFirst({
      where: { portfolio_id: id },
      orderBy: { position: 'desc' },
      select: { position: true }
    });
    
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

    const newBlock = await prisma.portfolioBlock.create({
      data: {
        portfolio_id: id,
        block_type,
        position: nextPosition,
        config: defaultConfig,
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
