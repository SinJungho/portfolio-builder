/**
 * GET /api/portfolios/generate/:job_id 응답 타입
 *
 * 클라이언트 폴링 규칙:
 * - 폴링 간격: 3초
 * - 타임아웃: 60초 (20회 초과 시 클라이언트에서 타임아웃 처리)
 * - status: 'completed' 또는 'failed' 수신 시 폴링 중단
 */
export type GenerateJobResponse = {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  blocks?: unknown[]
  published_url?: string | null
  missing_optional_fields?: string[]
  error?: string
}
