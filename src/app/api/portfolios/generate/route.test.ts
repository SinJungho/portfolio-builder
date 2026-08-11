/** @jest-environment node */

import { POST } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ratelimit } from "@/lib/redis";

jest.mock("next/server", () => ({
  ...jest.requireActual("next/server"),
  after: jest.fn(),
}));
jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: { portfolio: { findUnique: jest.fn() } },
}));
jest.mock("@/lib/generate/generatePortfolio", () => ({ generatePortfolio: jest.fn() }));
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
    redis: { set: jest.fn() },
    withRedis: operation,
  };
});

describe("POST /api/portfolios/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (ratelimit.limit as jest.Mock).mockRejectedValue(new Error("fetch failed"));
  });

  it("returns 503 when Redis is unavailable during project generation", async () => {
    const response = await POST(
      new Request("http://localhost/api/portfolios/generate", {
        method: "POST",
        body: JSON.stringify({ portfolio_id: "portfolio-1" }),
      }),
    );

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      code: "REDIS_UNAVAILABLE",
      error: "서비스 연결이 불안정해요. 잠시 후 다시 시도해 주세요.",
    });
    expect(prisma.portfolio.findUnique).not.toHaveBeenCalled();
  });
});
