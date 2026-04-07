import { NextResponse } from "next/server";
import { generatePortfolio } from "@/lib/generate/generatePortfolio";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const secret = process.env.INTERNAL_API_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return new NextResponse(null, { status: 401 });
    }

    const body = await req.json();
    const { job_id, portfolio_id, user_id, auto_publish, project_ids, ai_focus } = body;

    if (!job_id || !portfolio_id || !user_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fire and forget
    generatePortfolio({
      jobId: job_id,
      portfolioId: portfolio_id,
      userId: user_id,
      autoPublish: auto_publish ?? true,
      projectIds: project_ids,
      goal: ai_focus,
    }).catch(console.error);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("POST /api/portfolios/generate/run error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
