import { NextResponse, after } from 'next/server'
import { auth } from '@/auth'
import { RedisUnavailableError, redis, ratelimit, withRedis, JOB_KEY, JOB_TTL, type JobStatus } from '@/lib/redis'
import { syncGithubData } from '@/lib/sync/syncGithub'
import { apiError, logRouteError, logRouteWarning, routeError } from '@/lib/api/errors'

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401)
    }
    
    const userId = session.user.id
    
    const { success } = await withRedis(() => ratelimit.limit(`sync_${userId}`));
    if (!success) {
      return apiError("RATE_LIMITED", 429)
    }

    const { force = false } = await req.json().catch((error: unknown) => {
      logRouteWarning('/api/integrations/github/sync', 'POST', error, 'Invalid JSON');
      return {};
    })
    const jobId = `sync_${crypto.randomUUID()}`

    const initialStatus: JobStatus = {
      status: 'pending',
      progress: 0,
      portfolio_id: '',
      user_id: userId,
      auto_publish: false,
    }

    await withRedis(() => redis.setex(JOB_KEY(jobId), JOB_TTL, JSON.stringify(initialStatus)))

    // 동기화 작업은 응답 후 백그라운드에서 실행한다.
    after(async () => {
      await syncGithubData({
        jobId: jobId,
        userId: userId,
        force,
      }).catch((error) => logRouteError('/api/integrations/github/sync/background', 'POST', error));
    });

    return NextResponse.json(
      { job_id: jobId, estimated_seconds: 60 },
      { status: 202 }
    )
  } catch (error) {
    if (error instanceof RedisUnavailableError) {
      logRouteError('/api/integrations/github/sync/redis', 'POST', error.cause);
      return apiError("REDIS_UNAVAILABLE", 503);
    }
    return routeError('/api/integrations/github/sync', 'POST', error)
  }
}
