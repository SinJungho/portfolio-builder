import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redis, JOB_KEY, JOB_TTL, JobStatus } from "@/lib/redis";

interface GenerateRequest {
  portfolio_id: string;
  auto_publish?: boolean;
  project_ids?: string[];
  ai_focus?: string;
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { user } = session;

    let json = {} as GenerateRequest;
    try {
      json = await req.json();
    } catch {
      // ignore
    }

    const portfolio_id = json.portfolio_id;
    const auto_publish = json.auto_publish ?? true;
    const project_ids = json.project_ids;
    const ai_focus = json.ai_focus;

    if (!portfolio_id) {
      return NextResponse.json({ error: "portfolio_id is required" }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio_id },
    });

    if (!portfolio || portfolio.user_id !== user.id) {
      return new NextResponse(null, { status: 404 });
    }


    const job_id = crypto.randomUUID();

    const initialJobStatus: JobStatus = {
      status: "pending",
      progress: 0,
      portfolio_id,
      user_id: user.id,
      auto_publish,
    };

    try {
      await redis.set(JOB_KEY(job_id), JSON.stringify(initialJobStatus), { ex: JOB_TTL });
    } catch (err) {
      throw err;
    }
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
    
    fetch(`${appUrl}/api/portfolios/generate/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
      },
      body: JSON.stringify({
        job_id,
        portfolio_id,
        user_id: user.id,
        auto_publish,
        project_ids,
        ai_focus,
      }),
    }).catch(console.error); // Fire and forget

    return NextResponse.json({ job_id, estimated_seconds: 30 }, { status: 202 });
  } catch (error) {
    console.error("POST /api/portfolios/generate error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 });
  }
}
