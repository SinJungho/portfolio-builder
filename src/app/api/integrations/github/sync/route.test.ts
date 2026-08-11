/** @jest-environment node */

import { POST } from "./route";
import { auth } from "@/auth";
import { after } from "next/server";
import { ratelimit, redis } from "@/lib/redis";
import { syncGithubData } from "@/lib/sync/syncGithub";

jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: jest.fn(),
}));
jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/sync/syncGithub", () => ({ syncGithubData: jest.fn() }));
jest.mock("@/lib/redis", () => {
  const actual = jest.requireActual("@/lib/redis");
  const operation = async (callback: () => Promise<unknown>) => {
    try {
      return await callback();
    } catch (error) {
      throw new actual.RedisUnavailableError(error);
    }
  };

  return {
    ...actual,
    ratelimit: { limit: jest.fn() },
    redis: { setex: jest.fn() },
    withRedis: operation,
  };
});

describe("POST /api/integrations/github/sync", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (ratelimit.limit as jest.Mock).mockResolvedValue({ success: true });
    (redis.setex as jest.Mock).mockResolvedValue("OK");
  });

  it("returns 503 when Redis fails before creating a sync job", async () => {
    (ratelimit.limit as jest.Mock).mockRejectedValue(new Error("fetch failed"));

    const response = await POST(
      new Request("http://localhost/api/integrations/github/sync", {
        method: "POST",
        body: JSON.stringify({ force: true }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      code: "REDIS_UNAVAILABLE",
      error: "서비스 연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
    });
    expect(redis.setex).not.toHaveBeenCalled();
    expect(syncGithubData).not.toHaveBeenCalled();
  });

  it("creates a job when Redis is available", async () => {
    const response = await POST(
      new Request("http://localhost/api/integrations/github/sync", {
        method: "POST",
        body: JSON.stringify({ force: true }),
      }),
    );

    expect(response.status).toBe(202);
    expect(redis.setex).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);
  });
});
