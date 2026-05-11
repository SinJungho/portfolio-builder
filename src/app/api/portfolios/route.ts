import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createPortfolioSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).min(3).max(50).optional(),
  theme: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { user } = session;

    let json = {};
    try {
      json = await req.json();
    } catch {
      // ignore
    }

    const parseResult = createPortfolioSchema.safeParse(json);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error.message }, { status: 400 });
    }

    const { slug: requestedSlug, theme } = parseResult.data;

    // Fetch user details
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { github_login: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const baseSlug = requestedSlug || dbUser.github_login || `user-${user.id.substring(0, 5)}`;
    let finalSlug = baseSlug;
    let attempt = 0;
    let slugExists = true;

    while (slugExists && attempt < 10) {
      const existing = await prisma.portfolio.findUnique({
        where: { slug: finalSlug },
      });

      if (!existing) {
        slugExists = false;
      } else {
        attempt++;
        finalSlug = `${baseSlug}-${attempt + 1}`;
      }
    }

    if (slugExists) {
      return NextResponse.json({ error: "Failed to generate a unique slug" }, { status: 500 });
    }

    const portfolio = await prisma.portfolio.create({
      data: {
        user_id: user.id,
        slug: finalSlug,
        theme: theme || "minimal",
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
    console.error("POST /api/portfolios error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { user } = session;

    const portfolios = await prisma.portfolio.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: "desc" },
    });

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { github_bio_verified: true }
    });
    
    // Also see sync status
    const integration = await prisma.integration.findFirst({
      where: { user_id: user.id, provider: "github" },
      orderBy: { synced_at: "desc" }
    });

    return NextResponse.json({
      portfolios,
      user: dbUser,
      github_synced_at: integration?.synced_at || null,
    });
  } catch (error: unknown) {
    console.error("GET /api/portfolios error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
