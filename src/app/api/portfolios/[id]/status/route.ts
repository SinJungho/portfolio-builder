import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { id } = await props.params;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        is_published: true,
        slug: true,
      },
    });

    if (!portfolio || portfolio.user_id !== session.user.id) {
      return new NextResponse(null, { status: 404 });
    }

    return NextResponse.json({
      is_published: portfolio.is_published,
      published_url: portfolio.slug ? `/${portfolio.slug}` : null,
    });
  } catch (error: any) {
    console.error("GET /api/portfolios/[id]/status error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
