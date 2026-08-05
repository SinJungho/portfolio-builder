import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { redis, JOB_KEY } from "@/lib/redis";
import type { GenerateJobResponse } from "@/types/generate";
import { apiError, routeError } from "@/lib/api/errors";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401);
    }

    const { job_id } = await params;

    const jobStr = await redis.get(JOB_KEY(job_id));
    if (!jobStr) {
      return apiError("JOB_NOT_FOUND", 404);
    }

    const job = (typeof jobStr === "string" ? JSON.parse(jobStr) : jobStr) as GenerateJobResponse & { user_id: string };

    if (job.user_id !== session.user.id) {
      return apiError("FORBIDDEN", 403);
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
    return routeError('/api/portfolios/generate/[job_id]', 'GET', error);
  }
}

// 클라이언트는 3초 간격으로 최대 60초 동안 상태를 조회한다.
