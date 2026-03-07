import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { redis, JOB_KEY, type JobStatus } from '@/lib/redis'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Next.js 15: params must be awaited
  const { job_id } = await params

  const raw = await redis.get(JOB_KEY(job_id))
  if (!raw) {
    return NextResponse.json({ error: 'job_not_found' }, { status: 404 })
  }

  const job: JobStatus =
    typeof raw === 'string' ? (JSON.parse(raw) as JobStatus) : (raw as JobStatus)

  if (job.user_id !== session.user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // Final status with progress and synced_count (if present)
  return NextResponse.json(job, { status: 200 })
}
