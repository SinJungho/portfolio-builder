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
})

export const env = envSchema.parse(process.env)
