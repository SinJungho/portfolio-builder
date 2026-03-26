import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = Redis.fromEnv()

// Rate Limiter: 10 requests per 10 seconds (example, adjust as needed)
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'portfolioforge:ratelimit'
})

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

// GitHub API Cache Keys
export const GITHUB_CACHE_KEY = (userId: string) => `github_sync_cache:${userId}`
export const GITHUB_CACHE_TTL = 3600 // 1시간 (as per REQUEST.md)
