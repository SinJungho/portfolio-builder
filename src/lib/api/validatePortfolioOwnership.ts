import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function validatePortfolioOwnership(portfolioId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: new NextResponse(null, { status: 401 }), session: null, portfolio: null };
  }

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
  });

  if (!portfolio) {
    return { error: new NextResponse(null, { status: 404 }), session, portfolio: null };
  }

  if (portfolio.user_id !== session.user.id) {
    return { error: NextResponse.json({ error: "forbidden" }, { status: 403 }), session, portfolio };
  }

  return { error: null, session, portfolio };
}
