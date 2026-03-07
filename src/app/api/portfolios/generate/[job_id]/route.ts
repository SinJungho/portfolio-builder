import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { redis, JOB_KEY, type JobStatus } from '@/lib/redis'
import type { GenerateJobResponse } from '@/types/generate'

/**
 * GET /api/portfolios/generate/:job_id
 *
 * 클라이언트 폴링 규칙:
 * - 폴링 간격: 3초
 * - 타임아웃: 60초 (20회 초과 시 클라이언트에서 타임아웃 처리)
 * - status: 'completed' 또는 'failed' 수신 시 폴링 중단
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ job_id: string }> }
) {
  // 1. 세션 확인
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Next.js 15: params는 Promise 타입이므로 await 필요
  const { job_id } = await params

  // 2. Redis에서 job 조회
  const raw = await redis.get(JOB_KEY(job_id))
  if (!raw) {
    return NextResponse.json({ error: 'job_not_found' }, { status: 404 })
  }

  // Redis 값 파싱 (문자열이면 JSON.parse, 이미 객체이면 그대로 사용)
  const job: JobStatus =
    typeof raw === 'string' ? (JSON.parse(raw) as JobStatus) : (raw as JobStatus)

  // 3. 본인 job인지 확인
  if (job.user_id !== session.user.id) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // 4. job 상태 그대로 반환
  const response: GenerateJobResponse = {
    status: job.status,
    progress: job.progress,
    ...(job.blocks !== undefined && { blocks: job.blocks }),
    ...(job.published_url !== undefined && { published_url: job.published_url }),
    ...(job.missing_optional_fields !== undefined && {
      missing_optional_fields: job.missing_optional_fields,
    }),
    ...(job.error !== undefined && { error: job.error }),
  }

  return NextResponse.json(response, { status: 200 })
}
