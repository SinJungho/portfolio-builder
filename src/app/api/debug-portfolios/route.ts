import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const portfolios = await prisma.portfolio.findMany({ select: { id: true, user_id: true } });
  return NextResponse.json({ count: portfolios.length, portfolios });
}
