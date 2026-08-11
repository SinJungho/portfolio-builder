import { NextResponse, after } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { RedisUnavailableError, redis, ratelimit, withRedis, JOB_KEY, JOB_TTL, JobStatus } from "@/lib/redis";
import { generatePortfolio } from "@/lib/generate/generatePortfolio";
import { MAX_FEATURED_PROJECTS } from "@/lib/project-selection";
import { apiError, logRouteError, logRouteWarning, routeError } from "@/lib/api/errors";
import { z } from "zod";

const generateSchema = z.object({
  portfolio_id: z.string().uuid(),
  auto_publish: z.boolean().default(false),
  project_ids: z.array(z.string().uuid()).max(MAX_FEATURED_PROJECTS).optional(),
  ai_focus: z.string().trim().max(500).optional(),
});

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

    const json = await req.json().catch((error: unknown) => {
      logRouteWarning('/api/portfolios/generate', 'POST', error, 'Invalid JSON');
      return null;
    });
    const parsed = generateSchema.safeParse(json);
    if (!parsed.success) return apiError("INVALID_REQUEST", 400);
    const { portfolio_id, auto_publish, project_ids, ai_focus } = parsed.data;
    if (project_ids && new Set(project_ids).size !== project_ids.length) {
      return apiError("INVALID_REQUEST", 400);
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio_id },
    });

    if (!portfolio || portfolio.user_id !== user.id) {
      return apiError("NOT_FOUND", 404);
    }

    if (project_ids?.length) {
      const ownedProjects = await prisma.rawProject.count({
        where: { id: { in: project_ids }, user_id: user.id, is_fork: false },
      });
      if (ownedProjects !== project_ids.length) return apiError("INVALID_REQUEST", 400);
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
