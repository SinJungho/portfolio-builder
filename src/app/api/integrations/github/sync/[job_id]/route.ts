import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { redis, JOB_KEY, type JobStatus } from '@/lib/redis'
import { apiError, routeError } from '@/lib/api/errors'

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

    const raw = await redis.get(JOB_KEY(job_id))
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
    return routeError('/api/integrations/github/sync/[job_id]', 'GET', error)
  }
}
