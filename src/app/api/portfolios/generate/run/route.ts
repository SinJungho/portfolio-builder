import { NextResponse } from 'next/server'
import { generatePortfolio } from '@/lib/generate/generatePortfolio'

export async function POST(req: Request) {
  // 1. 내부 호출 보호용 헤더 검증
  const authHeader = req.headers.get('Authorization')
  const expectedAuth = `Bearer ${process.env.INTERNAL_API_SECRET}`

  if (!authHeader || authHeader !== expectedAuth) {
    return NextResponse.json({ error: 'Unauthorized internal call' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { job_id, portfolio_id, user_id, auto_publish } = body

    if (!job_id || !portfolio_id || !user_id) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    // 2. 백그라운드 작업 비동기 시작 (await 없음)
    // 에러 핸들링은 내부적으로 수행됨
    generatePortfolio({
      jobId: job_id,
      portfolioId: portfolio_id,
      userId: user_id,
      autoPublish: auto_publish ?? true,
    }).catch(console.error)

    // 3. 응답은 즉시 반환
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('Failed to parse generate run request:', err)
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 })
  }
}
