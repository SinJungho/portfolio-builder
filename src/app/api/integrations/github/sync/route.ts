import { NextResponse, after } from 'next/server'
import { auth } from '@/auth'
import { redis, JOB_KEY, JOB_TTL, type JobStatus } from '@/lib/redis'
import { syncGithubData } from '@/lib/sync/syncGithub'

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { force = false } = await req.json().catch(() => ({}))
    const userId = session.user.id
    const jobId = `sync_${crypto.randomUUID()}`

    const initialStatus: JobStatus = {
      status: 'pending',
      progress: 0,
      portfolio_id: '',
      user_id: userId,
      auto_publish: false,
    }

    await redis.setex(JOB_KEY(jobId), JOB_TTL, JSON.stringify(initialStatus))

    // Launch background work via next/server after()
    after(async () => {
      await syncGithubData({
        jobId: jobId,
        userId: userId,
        force,
      }).catch(console.error);
    });

    return NextResponse.json(
      { job_id: jobId, estimated_seconds: 60 },
      { status: 202 }
    )
  } catch (error) {
    console.error('POST /api/integrations/github/sync error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
