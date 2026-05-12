"use server";

import { auth } from "@/auth";
import { portfolioService } from "@/services/portfolio";
import type { Portfolio } from "@prisma/client";

export async function getUserPortfolios(): Promise<Portfolio[]> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return portfolioService.findAllByUserId(session.user.id);
}
