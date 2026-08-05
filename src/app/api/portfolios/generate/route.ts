import { NextResponse, after } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RedisUnavailableError, redis, ratelimit, withRedis, JOB_KEY, JOB_TTL, JobStatus } from "@/lib/redis";
import { generatePortfolio } from "@/lib/generate/generatePortfolio";
import { MAX_FEATURED_PROJECTS } from "@/lib/project-selection";
import { apiError, logRouteError, logRouteWarning, routeError } from "@/lib/api/errors";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401);
    }

    const { user } = session;

    const { success } = await withRedis(() => ratelimit.limit(`generate_${user.id}`));
    if (!success) {
      return apiError("RATE_LIMITED", 429);
    }

    const json: Record<string, unknown> = await req.json().catch((error: unknown) => {
      logRouteWarning('/api/portfolios/generate', 'POST', error, 'Invalid JSON');
      return {};
    });

    const portfolio_id = json.portfolio_id as string;
    const auto_publish = (json.auto_publish as boolean) ?? false;
    const project_ids = Array.isArray(json.project_ids) &&
      json.project_ids.every((id: unknown): id is string => typeof id === "string")
      ? json.project_ids
      : undefined;
    const ai_focus = json.ai_focus as string | undefined;

    if (!portfolio_id) {
      return apiError("PORTFOLIO_ID_REQUIRED", 400);
    }
    if (project_ids && project_ids.length > MAX_FEATURED_PROJECTS) {
      return apiError("PROJECT_LIMIT", 400);
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio_id },
    });

    if (!portfolio || portfolio.user_id !== user.id) {
      return apiError("NOT_FOUND", 404);
    }


    const job_id = crypto.randomUUID();

    const initialJobStatus: JobStatus = {
      status: "pending",
      progress: 0,
      portfolio_id,
      user_id: user.id,
      auto_publish,
    };

    await withRedis(() => redis.set(JOB_KEY(job_id), JSON.stringify(initialJobStatus), { ex: JOB_TTL }));
    after(async () => {
      await generatePortfolio({
        jobId: job_id,
        portfolioId: portfolio_id,
        userId: user.id,
        autoPublish: auto_publish,
        projectIds: project_ids,
        goal: ai_focus,
      }).catch((error) => logRouteError('/api/portfolios/generate/background', 'POST', error));
    });

    return NextResponse.json({ job_id, estimated_seconds: 30 }, { status: 202 });
  } catch (error: unknown) {
    if (error instanceof RedisUnavailableError) {
      logRouteError('/api/portfolios/generate/redis', 'POST', error.cause);
      return apiError("REDIS_UNAVAILABLE", 503);
    }
    return routeError('/api/portfolios/generate', 'POST', error);
  }
}
