import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis, JOB_KEY } from "@/lib/redis";
import type { GenerateJobResponse } from "@/types/generate";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { job_id } = await params;

    const jobStr = await redis.get(JOB_KEY(job_id));
    if (!jobStr) {
      return NextResponse.json({ error: "job_not_found" }, { status: 404 });
    }

    const job = (typeof jobStr === "string" ? JSON.parse(jobStr) : jobStr) as GenerateJobResponse & { user_id: string };

    if (job.user_id !== session.user.id) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const response: GenerateJobResponse = {
      status: job.status,
      progress: job.progress,
      blocks: job.blocks,
      published_url: job.published_url,
      missing_optional_fields: job.missing_optional_fields,
      error: job.error,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error: unknown) {
    console.error("GET /api/portfolios/generate/[job_id] error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}

// 클라이언트 폴링 규칙:
// - 폴링 간격: 3초
// - 타임아웃: 60초 (20회 초과 시 클라이언트에서 타임아웃 처리)
// - status: 'completed' 또는 'status: 'failed' 수신 시 폴링 중단
