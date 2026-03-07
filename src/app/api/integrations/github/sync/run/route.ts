import { NextResponse } from 'next/server'
import { syncGithubData } from '@/lib/sync/syncGithub'

export async function POST(req: Request) {
  const authHeader = req.headers.get('Authorization')
  const expectedAuth = `Bearer ${process.env.INTERNAL_API_SECRET}`

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized internal call' }, { status: 401 })
  }

  try {
    const { job_id, user_id, force } = await req.json()

    if (!job_id || !user_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // Launch background work (fire-and-forget)
    syncGithubData({
      jobId: job_id,
      userId: user_id,
      force,
    }).catch(console.error)

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('Failed to parse sync run request:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
