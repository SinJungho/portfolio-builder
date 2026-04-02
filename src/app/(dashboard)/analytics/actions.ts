"use server";

import { auth } from "@/auth";
import { portfolioService } from "@/services/portfolio";

export async function getUserPortfolios() {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return portfolioService.findAllByUserId(session.user.id);
}
