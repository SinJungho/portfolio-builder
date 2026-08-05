import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, logRouteError } from "@/lib/api/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, portfolio_id, block_id, session_id, referrer, user_agent } = body;

    // Vercel 요청 헤더에서 국가 코드를 읽는다.
    const country_code = req.headers.get("x-vercel-ip-country") || undefined;

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
    logRouteError("/api/analytics/event", "POST", error);
    return apiError("TRACK_FAILED", 400);
  }
}
