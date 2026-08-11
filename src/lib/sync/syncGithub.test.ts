/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { syncGithubData } from "./syncGithub";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    integration: { findUnique: jest.fn(), upsert: jest.fn() },
    account: { findFirst: jest.fn() },
    rawProject: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));
jest.mock("@/lib/redis", () => ({
  JOB_KEY: (jobId: string) => `job:${jobId}`,
  redis: { get: jest.fn().mockResolvedValue(null), set: jest.fn() },
}));
jest.mock("@/lib/utils/security", () => ({
  safeDecrypt: (token?: string | null) => token ?? "",
  encrypt: (token: string) => `encrypted:${token}`,
}));

describe("syncGithubData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.integration.findUnique as jest.Mock).mockResolvedValue({ access_token: "stale-token" });
    (prisma.account.findFirst as jest.Mock).mockResolvedValue({ access_token: "fresh-token" });
    (prisma.rawProject.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.rawProject.upsert as jest.Mock).mockResolvedValue({});
    (prisma.rawProject.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.integration.upsert as jest.Mock).mockResolvedValue({});
    global.fetch = jest.fn();
  });

  it("retries a 401 with the account token and repairs the integration token", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(Response.json({ message: "Bad credentials" }, { status: 401 }))
      .mockResolvedValueOnce(Response.json([]));

    await syncGithubData({ jobId: "job-1", userId: "user-1" });

    expect(global.fetch).toHaveBeenNthCalledWith(1, expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer stale-token" }),
    }));
    expect(global.fetch).toHaveBeenNthCalledWith(2, expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer fresh-token" }),
    }));
    expect(prisma.integration.upsert).toHaveBeenCalledWith(expect.objectContaining({
      update: expect.objectContaining({ access_token: "encrypted:fresh-token" }),
    }));
    // 빈 목록에서 정리하면 멀쩡한 프로젝트를 전부 지운다. 아무것도 지우지 않아야 한다.
    expect(prisma.rawProject.deleteMany).not.toHaveBeenCalled();
  });

  it("fails the job when every listed repository fails to persist", async () => {
    const repo = {
      id: 42,
      name: "portfolio",
      full_name: "octocat/portfolio",
      description: null,
      html_url: "https://github.com/octocat/portfolio",
      stargazers_count: 0,
      forks_count: 0,
      language: "TypeScript",
      fork: false,
      pushed_at: "2026-01-01T00:00:00Z",
      topics: [],
    };
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(Response.json([repo]))
      .mockResolvedValueOnce(new Response("", { status: 404 }));
    (prisma.rawProject.upsert as jest.Mock).mockRejectedValue(new Error("database unavailable"));

    await syncGithubData({ jobId: "job-2", userId: "user-1" });

    expect(prisma.rawProject.deleteMany).toHaveBeenCalledWith({
      where: {
        user_id: "user-1",
        source: "github",
        OR: [
          { external_id: null },
          { external_id: { notIn: ["42"] } },
        ],
      },
    });
    expect(prisma.integration.upsert).not.toHaveBeenCalled();

    const finalJob = JSON.parse(
      (redis.set as jest.Mock).mock.calls.at(-1)[1] as string,
    );
    expect(finalJob).toEqual(expect.objectContaining({
      status: "failed",
      synced_count: 0,
      failed_count: 1,
      error: "GitHub 저장소를 동기화하지 못했습니다. 잠시 후 다시 시도해 주세요.",
    }));
  });
});
