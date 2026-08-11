import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/api/errors";

export async function validatePortfolioOwnership(portfolioId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: apiError("UNAUTHORIZED", 401), session: null, portfolio: null };
  }

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
  });

  if (!portfolio) {
    return { error: apiError("NOT_FOUND", 404), session, portfolio: null };
  }

  if (portfolio.user_id !== session.user.id) {
    return { error: apiError("FORBIDDEN", 403), session, portfolio };
  }

  return { error: null, session, portfolio };
}
