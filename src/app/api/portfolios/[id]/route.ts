import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { apiError, logRouteError, routeError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DesignTokenSchema } from "@/schemas/portfolio";
import {
  getMissingPortfolioReadiness,
  getSelectedProjectIds,
} from "@/lib/portfolio-readiness";

const updatePortfolioSchema = z.object({
  theme: z
    .enum(["spotify", "minimal", "midnight", "ocean", "forest", "sunset", "minimalist", "creative", "corporate", "dark", "pastel", "tech"])
    .optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  is_published: z.boolean().optional(),
  design_tokens: DesignTokenSchema.optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error, portfolio } = await validatePortfolioOwnership(id);
    if (error) return error;

    const json = await req.json().catch(() => ({}));

    const {
      success,
      data,
    } = updatePortfolioSchema.safeParse(json);
    if (!success) {
      return apiError("INVALID_REQUEST", 400);
    }

    const updateData: Record<string, unknown> = {};
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.design_tokens !== undefined) updateData.design_tokens = data.design_tokens;
    if (data.is_published !== undefined) {
      if (data.is_published && !portfolio?.is_published) {
        const blocks = await prisma.portfolioBlock.findMany({
          where: { portfolio_id: id },
          select: { block_type: true, is_visible: true, config: true },
        });
        const readinessBlocks = blocks.map((block) => ({
          ...block,
          config: block.config as Record<string, unknown>,
        }));
        const projectIds = getSelectedProjectIds(readinessBlocks);
        const availableProjectIds = projectIds.length
          ? (await prisma.rawProject.findMany({
              where: {
                id: { in: projectIds },
                user_id: portfolio.user_id,
                is_fork: false,
              },
              select: { id: true },
            })).map((project) => project.id)
          : [];
        const missing = getMissingPortfolioReadiness(
          readinessBlocks,
          availableProjectIds,
        );

        if (missing.length) {
          return apiError("PORTFOLIO_NOT_READY", 400, { missing_items: missing });
        }
      }
      updateData.is_published = data.is_published;
      updateData.published_at = data.is_published ? new Date() : null;
    }

    if (data.slug && data.slug !== portfolio?.slug) {
      const existing = await prisma.portfolio.findUnique({
        where: { slug: data.slug },
      });
      if (existing) {
        return apiError("SLUG_CONFLICT", 409);
      }
      updateData.slug = data.slug;
    }

    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: updateData,
    });

    if (updatedPortfolio.slug) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-internal-secret": process.env.INTERNAL_API_SECRET || "",
          },
          body: JSON.stringify({ slug: updatedPortfolio.slug }),
        });
      } catch (e) {
        logRouteError('/api/revalidate', 'POST', e);
      }
    }

    return NextResponse.json({ portfolio: updatedPortfolio }, { status: 200 });
  } catch (error: unknown) {
    return routeError('/api/portfolios/[id]', 'PATCH', error);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { error } = await validatePortfolioOwnership(id);
    if (error) return error;

    await prisma.portfolio.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    return routeError('/api/portfolios/[id]', 'DELETE', error);
  }
}
