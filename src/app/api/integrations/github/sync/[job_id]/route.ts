import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { RedisUnavailableError, redis, withRedis, JOB_KEY, type JobStatus } from '@/lib/redis'
import { apiError, logRouteError, routeError } from '@/lib/api/errors'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", 401)
  }

  try {
    const { job_id } = await params

    const raw = await withRedis(() => redis.get(JOB_KEY(job_id)))
    if (!raw) {
      return apiError("JOB_NOT_FOUND", 404)
    }

    const job: JobStatus =
      typeof raw === 'string' ? (JSON.parse(raw) as JobStatus) : (raw as JobStatus)

    if (job.user_id !== session.user.id) {
      return apiError("FORBIDDEN", 403)
    }

    return NextResponse.json(job, { status: 200 })
  } catch (error) {
    if (error instanceof RedisUnavailableError) {
      logRouteError('/api/integrations/github/sync/[job_id]/redis', 'GET', error.cause)
      return apiError("REDIS_UNAVAILABLE", 503)
    }
    return routeError('/api/integrations/github/sync/[job_id]', 'GET', error)
  }
}
