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
      return NextResponse.json({ error: "Invalid block_type" }, { status: 400 });
    }

    const maxPositionBlock = await prisma.portfolioBlock.findFirst({
      where: { portfolio_id: id },
      orderBy: { position: 'desc' },
      select: { position: true }
    });
    
    const nextPosition = maxPositionBlock ? maxPositionBlock.position + 1 : 0;

    let defaultConfig = {};
    if (block_type === 'hero') defaultConfig = { headline: "새 히어로 블록", subheadline: "", bio: "", show_github_stats: true };
    if (block_type === 'project_grid') defaultConfig = { layout: "grid", columns: 2, project_ids: [], show_tech_stack: true };
    if (block_type === 'skills') defaultConfig = { chart_type: "bar", skills: [] };
    if (block_type === 'blog_feed') defaultConfig = { integration_provider: "velog", max_items: 4, show_thumbnail: true };
    if (block_type === 'contact') defaultConfig = { github_url: "https://github.com", email: "", linkedin_url: "", website_url: "" };

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
  } catch (error: any) {
    console.error("POST /api/portfolios/[id]/blocks error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

