import { NextResponse } from "next/server";
import { type Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { apiError, routeError } from "@/lib/api/errors";
import { BlockConfigSchema, DesignTokenSchema, PortfolioThemeSchema } from "@/schemas/portfolio";
import { revalidatePath } from "next/cache";

const snapshotBlockSchema = z.object({
  id: z.string().uuid(),
  block_type: z.enum(["hero", "project_grid", "skills", "blog_feed", "contact"]),
  position: z.number().int().nonnegative(),
  config: z.record(z.string(), z.unknown()),
  is_visible: z.boolean(),
  is_ai_generated: z.boolean(),
});

const snapshotSchema = z.object({
  theme: PortfolioThemeSchema,
  design_tokens: DesignTokenSchema,
  blocks: z.array(snapshotBlockSchema).max(20),
}).superRefine(({ blocks }, context) => {
  const positions = new Set(blocks.map((block) => block.position));
  if (positions.size !== blocks.length || blocks.some((_, index) => !positions.has(index))) {
    context.addIssue({ code: "custom", path: ["blocks"], message: "positions must be contiguous" });
  }
  blocks.forEach((block, index) => {
    if (!BlockConfigSchema.safeParse({ block_type: block.block_type, config: block.config }).success) {
      context.addIssue({ code: "custom", path: ["blocks", index, "config"], message: "invalid block config" });
    }
  });
});

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    const parsed = snapshotSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return apiError("INVALID_REQUEST", 400);

    const ids = parsed.data.blocks.map((block) => block.id);
    if (new Set(ids).size !== ids.length) return apiError("INVALID_REQUEST", 400);

    const existingBlocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id },
      select: { id: true },
    });
    const foreignBlock = ids.length
      ? await prisma.portfolioBlock.findFirst({
          where: { id: { in: ids }, portfolio_id: { not: id } },
          select: { id: true },
        })
      : null;
    if (foreignBlock) return apiError("INVALID_REQUEST", 400);
    const existingIds = new Set(existingBlocks.map((block) => block.id));

    await prisma.$transaction(async (tx) => {
      await tx.portfolio.update({
        where: { id },
        data: {
          theme: parsed.data.theme,
          design_tokens: parsed.data.design_tokens,
        },
      });

      await tx.portfolioBlock.deleteMany({
        where: { portfolio_id: id, id: { notIn: ids } },
      });

      for (const block of parsed.data.blocks) {
        const validatedConfig = BlockConfigSchema.parse({
          block_type: block.block_type,
          config: block.config,
        });
        const data = {
          block_type: block.block_type,
          position: block.position,
          config: validatedConfig.config as Prisma.InputJsonObject,
          is_visible: block.is_visible,
          is_ai_generated: block.is_ai_generated,
        };
        if (existingIds.has(block.id)) {
          await tx.portfolioBlock.update({ where: { id: block.id }, data });
        } else {
          await tx.portfolioBlock.create({
            data: { id: block.id, portfolio_id: id, ...data },
          });
        }
      }
    });

    if (portfolio?.slug) revalidatePath(`/${portfolio.slug}`);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError("/api/portfolios/[id]/snapshot", "PUT", error);
  }
}
