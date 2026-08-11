import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { apiError, logRouteWarning, routeError } from "@/lib/api/errors";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PortfolioThemeSchema } from "@/schemas/portfolio";
import { normalizePortfolioSlug } from "@/lib/portfolio-url";

const createPortfolioSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(50).optional(),
  theme: PortfolioThemeSchema.optional(),
});

async function getUserId() {
  return (await auth())?.user?.id ?? null;
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return apiError("UNAUTHORIZED", 401);
    }

    const json = await req.json().catch((error: unknown) => {
      logRouteWarning('/api/portfolios', 'POST', error, 'Invalid JSON');
      return null;
    });
    const parseResult = createPortfolioSchema.safeParse(json);
    if (!parseResult.success) {
      return apiError("INVALID_REQUEST", 400);
    }

    const { slug: requestedSlug, theme } = parseResult.data;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { github_login: true },
    });

    if (!dbUser) {
      return apiError("USER_NOT_FOUND", 404);
    }

    const preferredSlug = normalizePortfolioSlug(requestedSlug || dbUser.github_login || "");
    // 접미사를 붙여도 normalizePortfolioSlug의 50자 한도를 넘지 않게 자리를 남긴다.
    // 넘기면 조회 시 잘려서 정작 만든 포트폴리오를 못 찾는다.
    const baseSlug = (preferredSlug.length >= 3
      ? preferredSlug
      : `user-${userId.substring(0, 5).toLowerCase()}`
    ).slice(0, 47);
    let finalSlug: string | null = null;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const candidate = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
      const existing = await prisma.portfolio.findUnique({
        where: { slug: candidate },
      });

      if (!existing) {
        finalSlug = candidate;
        break;
      }
    }

    if (!finalSlug) {
      return apiError("SLUG_UNAVAILABLE", 500);
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        user_id: userId,
        slug: finalSlug,
        theme: theme || "minimal",
        auto_published: false,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    return NextResponse.json(
      { portfolio_id: portfolio.id, slug: portfolio.slug },
      { status: 201 }
    );
  } catch (error: unknown) {
    return routeError("/api/portfolios", "POST", error);
  }
}

export async function GET() {
  try {
    const userId = await getUserId();
    if (!userId) {
      return apiError("UNAUTHORIZED", 401);
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        _count: { select: { blocks: true } },
        blocks: { select: { block_type: true, is_visible: true, config: true } },
      },
    });
    const availableProjects = await prisma.rawProject.findMany({
      where: { user_id: userId, is_fork: false },
      select: { id: true, description: true, ai_summary: true },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { github_bio_verified: true }
    });
    
    const [integration, account] = await Promise.all([
      prisma.integration.findFirst({
        where: { user_id: userId, provider: "github", is_active: true },
        orderBy: { synced_at: "desc" },
      }),
      prisma.account.findFirst({
        where: { userId, provider: "github" },
        select: { access_token: true },
      }),
    ]);

    return NextResponse.json({
      portfolios,
      available_project_ids: availableProjects.map((project) => project.id),
      described_project_ids: availableProjects
        .filter((project) => Boolean(project.description?.trim() || project.ai_summary?.trim()))
        .map((project) => project.id),
      user: dbUser,
      github_connected: Boolean(integration?.access_token || account?.access_token),
      github_synced_at: integration?.synced_at || null,
    });
  } catch (error: unknown) {
    return routeError("/api/portfolios", "GET", error);
  }
}
