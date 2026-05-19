"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Portfolio, PortfolioBlock } from "@prisma/client";

export type PortfolioWithBlocks = Portfolio & {
  blocks: PortfolioBlock[];
};

export async function getUserPortfolios(): Promise<PortfolioWithBlocks[]> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  return prisma.portfolio.findMany({
    where: { user_id: session.user.id },
    include: { blocks: true },
    orderBy: { updated_at: "desc" },
  }) as unknown as PortfolioWithBlocks[];
}
