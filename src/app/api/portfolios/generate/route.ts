import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redis, JOB_KEY, JOB_TTL, type JobStatus } from '@/lib/redis'
import { z } from 'zod'

const requestSchema = z.object({
  portfolio_id: z.string().uuid(),
  auto_publish: z.boolean().optional().default(true),
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await req.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    const { portfolio_id, auto_publish } = parsed.data

    // 해당 포트폴리오 존재 권한 확인
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio_id },
      select: { user_id: true },
    })

    if (!portfolio || portfolio.user_id !== userId) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // 유저 ai_credits 확인
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { ai_credits: true },
    })

    if (!user || user.ai_credits <= 0) {
      return NextResponse.json(
        { error: 'insufficient_credits', credits_remaining: user?.ai_credits ?? 0 },
        { status: 402 }
      )
    }

    // 1. 크레딧 차감
    await prisma.user.update({
      where: { id: userId },
      data: { ai_credits: { decrement: 1 } },
    })

    // 2. Job ID와 초기 상태 생성
    const job_id = crypto.randomUUID()
    
    const initialJobStatus: JobStatus = {
      status: 'pending',
      progress: 0,
      portfolio_id,
      user_id: userId,
      auto_publish,
    }

    try {
      // 3. Redis에 상태 등록 (TTL: 10분)
      await redis.setex(JOB_KEY(job_id), JOB_TTL, JSON.stringify(initialJobStatus))
    } catch (redisError) {
      console.error('Failed to store job in Redis:', redisError)
      // Redis 저장 실패 시 크레딧 롤백
      await prisma.user.update({
        where: { id: userId },
        data: { ai_credits: { increment: 1 } },
      })
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    // 4. 백그라운드 작업 시작 (fire-and-forget)
    const runApiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/portfolios/generate/run`
    
    fetch(runApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}`,
      },
      body: JSON.stringify({
        job_id,
        portfolio_id,
        user_id: userId,
        auto_publish,
      }),
    }).catch((err) => {
      console.error('Failed to trigger generate run API:', err)
    })

    // 5. 즉시 응답 (202 Accepted)
    return NextResponse.json(
      { job_id, estimated_seconds: 30 },
      { status: 202 }
    )
  } catch (error) {
    console.error('POST /api/portfolios/generate error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
