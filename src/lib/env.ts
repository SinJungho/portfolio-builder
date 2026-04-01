import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  AUTH_GITHUB_ID: z.string().min(1),
  AUTH_GITHUB_SECRET: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  INTERNAL_API_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  ENCRYPTION_KEY: z.string().length(64), // hex 인코딩 기준 32바이트 = 64자
  GITHUB_WEBHOOK_SECRET: z.string().min(1),
  SENTRY_DSN: z.string().url().optional(),
  SUPABASE_STORAGE_ENDPOINT: z.string().url().optional(),
  SUPABASE_STORAGE_ACCESS_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_SECRET_KEY: z.string().min(1).optional(),
  SUPABASE_STORAGE_REGION: z.string().min(1).optional(),
  SUPABASE_STORAGE_BUCKET: z.string().min(1).optional(),
})

// 최상단에서 바로 parse하지 않고 실제 호출 시점에 검증 (lazy validation)
let _env: z.infer<typeof envSchema> | null = null

export function getEnv(): z.infer<typeof envSchema> {
  if (!_env) {
    const result = envSchema.safeParse(process.env)
    if (!result.success) {
      console.error('❌ Invalid environment variables:', result.error.format())
      throw new Error(`Invalid environment variables: ${result.error.message}`)
    }
    _env = result.data
  }
  return _env
}

// 기존 코드 호환성 유지용 proxy (런타임 접근 시점에 검증)
export const env = new Proxy({} as z.infer<typeof envSchema>, {
  get(_target, prop: string) {
    return getEnv()[prop as keyof z.infer<typeof envSchema>]
  },
})
