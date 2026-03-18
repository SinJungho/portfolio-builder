import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

const updatePortfolioSchema = z.object({
  theme: z
    .enum(["minimalist", "creative", "corporate", "dark", "pastel", "tech"])
    .optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
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
    } catch (e) {
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

    const updateData: any = {};
    if (data.theme !== undefined) updateData.theme = data.theme;
    if (data.title !== undefined) updateData.title = data.title;

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
      revalidatePath(`/${updatedPortfolio.slug}`);
    }

    return NextResponse.json({ portfolio: updatedPortfolio }, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/portfolios/[id] error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
