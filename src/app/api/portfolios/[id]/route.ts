import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

import { DesignTokenSchema } from "@/schemas/portfolio";

const updatePortfolioSchema = z.object({
  theme: z
    .enum(["minimal", "midnight", "ocean", "forest", "sunset", "minimalist", "creative", "corporate", "dark", "pastel", "tech"])
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

    let json = {};
    try {
      json = await req.json();
    } catch {
      // ignore
    }

    const {
      success,
      data,
      error: zError,
    } = updatePortfolioSchema.safeParse(json);
    if (!success) {
      return NextResponse.json({ error: zError.message }, { status: 400 });
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
        const visibleBlock = (type: string) =>
          blocks.find((block) => block.block_type === type && block.is_visible);
        const projectBlock = visibleBlock("project_grid");
        const contactBlock = visibleBlock("contact");
        const projectIds = projectBlock?.config as { project_ids?: unknown } | undefined;
        const contact = contactBlock?.config as
          | { email?: unknown; linkedin_url?: unknown; website_url?: unknown }
          | undefined;
        const missing = [
          !visibleBlock("hero") && "소개를 표시하기",
          !(Array.isArray(projectIds?.project_ids) && projectIds.project_ids.length) && "대표 프로젝트 고르기",
          !(
            typeof contact?.email === "string" && contact.email.trim()
            || typeof contact?.linkedin_url === "string" && contact.linkedin_url.trim()
            || typeof contact?.website_url === "string" && contact.website_url.trim()
          ) && "연락처 추가하기",
        ].filter(Boolean);

        if (missing.length) {
          return NextResponse.json(
            { error: `공개 전 다음 항목을 완료해주세요: ${missing[0]}.` },
            { status: 400 },
          );
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
        return NextResponse.json({ error: "slug_conflict" }, { status: 409 });
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
        console.error("Revalidate explicitly failed:", e);
      }
    }

    return NextResponse.json({ portfolio: updatedPortfolio }, { status: 200 });
  } catch (error: unknown) {
    console.error("PATCH /api/portfolios/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 },
    );
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
    console.error("DELETE /api/portfolios/[id] error:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Internal server error" },
      { status: 500 },
    );
  }
}
