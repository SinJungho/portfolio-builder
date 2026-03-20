import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, portfolio_id, block_id, session_id, referrer, user_agent } = body;

    // Optional: get basic country code from request headers (Vercel provides this)
    const country_code = req.headers.get("x-vercel-ip-country") || undefined;

    // Track event
    // Using fire-and-forget or await depending on strictness
    // Usually analytics should not block, but for simplicity we await it here
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
    console.error("Analytics Event Error:", error);
    return NextResponse.json({ error: "failed_to_track" }, { status: 400 });
  }
}
