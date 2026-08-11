import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, routeError } from "@/lib/api/errors";
import { z } from "zod";

const eventSchema = z.object({
  event_type: z.enum(["page_view", "block_click", "contact_click"]),
  portfolio_id: z.string().uuid(),
  block_id: z.string().uuid().nullish(),
  session_id: z.string().max(100).nullish(),
  referrer: z.string().max(2048).nullish(),
  user_agent: z.string().max(500).nullish(),
}).superRefine(({ event_type, block_id }, context) => {
  if (event_type !== "page_view" && !block_id) {
    context.addIssue({ code: "custom", path: ["block_id"], message: "block_id is required" });
  }
  if (event_type === "page_view" && block_id) {
    context.addIssue({ code: "custom", path: ["block_id"], message: "page views cannot target a block" });
  }
});

export async function POST(req: Request) {
  try {
    const parsed = eventSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) return apiError("INVALID_REQUEST", 400);
    const { event_type, portfolio_id, block_id, session_id, referrer, user_agent } = parsed.data;

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio_id },
      select: { is_published: true },
    });
    if (!portfolio?.is_published) return apiError("NOT_FOUND", 404);

    if (block_id) {
      const block = await prisma.portfolioBlock.findFirst({
        where: { id: block_id, portfolio_id, is_visible: true },
        select: { id: true },
      });
      if (!block) return apiError("BLOCK_NOT_FOUND", 404);
    }

    // Vercel 요청 헤더에서 국가 코드를 읽는다.
    const country = req.headers.get("x-vercel-ip-country")?.toUpperCase();
    const country_code = country && /^[A-Z]{2}$/.test(country) ? country : undefined;

    await prisma.analyticsEvent.create({
      data: {
        event_type,
        portfolio_id,
        block_id,
        session_id,
        referrer,
        user_agent,
        country_code,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return routeError("/api/analytics/event", "POST", error);
  }
}
