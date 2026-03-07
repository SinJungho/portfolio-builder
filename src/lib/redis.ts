import { Redis } from '@upstash/redis'

export const redis = Redis.fromEnv()

// 타입 정의
export type JobStatus = {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  portfolio_id: string
  user_id: string
  auto_publish: boolean
  blocks?: unknown[]
  published_url?: string | null
  missing_optional_fields?: string[]
  error?: string
}

export const JOB_KEY = (jobId: string) => `generate_job:${jobId}`
export const JOB_TTL = 600 // 10분
