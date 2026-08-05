import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const actualRedis = Redis.fromEnv();

export class RedisUnavailableError extends Error {
  constructor(public readonly cause: unknown) {
    super("Redis unavailable");
    this.name = "RedisUnavailableError";
  }
}

export async function withRedis<T>(operation: () => Promise<T>): Promise<T> {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (!url || !token) throw new Error("REDIS_CONFIG_MISSING");
    return await operation();
  } catch (error) {
    throw new RedisUnavailableError(error);
  }
}

const globalForCache = globalThis as unknown as {
  localRedisCache?: Map<string, { value: unknown; expiresAt?: number }>;
};

if (!globalForCache.localRedisCache) {
  globalForCache.localRedisCache = new Map();
}

const localCache = globalForCache.localRedisCache;

export const redis: Redis = new Proxy(actualRedis, {
  get(target, prop, receiver) {
    const originalValue = Reflect.get(target, prop, receiver);

    if (typeof originalValue === "function") {
      return async function (...args: unknown[]) {
        const methodName = String(prop);
        try {
          const result = await originalValue.apply(target, args);

          // Write-Through 캐싱: 성공한 Upstash 작업 결과를 로컬 인메모리 캐시에도 실시간 복사
          if (methodName === "get") {
            const key = args[0] as string;
            if (result !== undefined && result !== null) {
              localCache.set(key, { value: result, expiresAt: Date.now() + 600 * 1000 });
            }
          } else if (methodName === "set") {
            const key = args[0] as string;
            const value = args[1];
            const options = args[2] as { ex?: number } | undefined;
            const expiresAt = options?.ex ? Date.now() + options.ex * 1000 : undefined;
            localCache.set(key, { value, expiresAt });
          } else if (methodName === "setex") {
            const key = args[0] as string;
            const ttl = args[1] as number;
            const value = args[2];
            const expiresAt = Date.now() + ttl * 1000;
            localCache.set(key, { value, expiresAt });
          } else if (methodName === "del") {
            const key = args[0] as string;
            localCache.delete(key);
          }

          return result;
        } catch (error) {
          const err = error as { message?: string; code?: string };
          const isNetworkError =
            err?.message?.includes("fetch failed") ||
            err?.code === "ENOTFOUND" ||
            err?.message?.includes("ENOTFOUND");

          if (isNetworkError) {
            // 운영(Production) 환경에서는 인메모리 임시 캐시를 사용하지 않고 명시적으로 예외를 발생시켜 장애를 조기 감지(Fail-fast)합니다.
            if (process.env.NODE_ENV === "production") {
              console.error("[Redis Error] 운영 환경에서 Upstash Redis 연결에 실패했습니다.", error);
              throw error;
            }

            console.warn(
              `ℹ️ [Upstash Redis 오프라인] Upstash 서버와 연결할 수 없어 ${methodName} 작업을 로컬 인메모리 캐시로 대체하여 안전하게 처리했습니다. (정상 작동 중)`,
            );

            if (methodName === "get") {
              const key = args[0] as string;
              const item = localCache.get(key);
              if (item && item.expiresAt && Date.now() > item.expiresAt) {
                localCache.delete(key);
                return null;
              }
              return item ? item.value : null;
            }

            if (methodName === "set") {
              const key = args[0] as string;
              const value = args[1];
              const options = args[2] as { ex?: number } | undefined;
              const expiresAt = options?.ex
                ? Date.now() + options.ex * 1000
                : undefined;
              localCache.set(key, { value, expiresAt });
              return "OK";
            }

            if (methodName === "setex") {
              const key = args[0] as string;
              const ttl = args[1] as number;
              const value = args[2];
              const expiresAt = Date.now() + ttl * 1000;
              localCache.set(key, { value, expiresAt });
              return "OK";
            }

            if (methodName === "del") {
              const key = args[0] as string;
              return localCache.delete(key) ? 1 : 0;
            }

            return null;
          }

          throw error;
        }
      };
    }

    return originalValue;
  },
}) as unknown as Redis;

// Rate Limiter: 10 requests per 10 seconds (example, adjust as needed)
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "portfolioforge:ratelimit",
});

// 타입 정의
export type JobStatus = {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  portfolio_id: string;
  user_id: string;
  auto_publish: boolean;
  blocks?: unknown[];
  published_url?: string | null;
  missing_optional_fields?: string[];
  error?: string;
};

export const JOB_KEY = (jobId: string) => `generate_job:${jobId}`;
export const JOB_TTL = 600; // 10분

// GitHub API Cache Keys
export const GITHUB_CACHE_KEY = (userId: string) =>
  `github_sync_cache:${userId}`;
export const GITHUB_CACHE_TTL = 3600; // 1시간 (as per REQUEST.md)
