/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";
import { generatePortfolio } from "./generatePortfolio";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    rawProject: { findMany: jest.fn(), update: jest.fn() },
    integration: { findMany: jest.fn() },
    portfolio: { findFirst: jest.fn(), update: jest.fn() },
    portfolioBlock: { deleteMany: jest.fn(), createMany: jest.fn() },
    $transaction: jest.fn(),
  },
}));
jest.mock("@/lib/redis", () => ({
  JOB_KEY: (jobId: string) => `job:${jobId}`,
  JOB_TTL: 600,
  redis: { get: jest.fn(), set: jest.fn() },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));
jest.mock("openai", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: "{}" } }],
        }),
      },
    },
  })),
}));

describe("generatePortfolio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (redis.get as jest.Mock).mockResolvedValue(JSON.stringify({
      status: "pending",
      progress: 0,
      portfolio_id: "portfolio-1",
      user_id: "user-1",
      auto_publish: true,
    }));
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "홍길동",
      email: null,
      github_login: null,
      github_bio: "백엔드 개발자",
    });
    (prisma.rawProject.findMany as jest.Mock).mockResolvedValue([{
      id: "project-1",
      name: "payments-api",
      description: null,
      language: null,
      stargazers_count: 3,
      is_fork: false,
      pushed_at: null,
      raw_data: {},
      ai_summary: null,
      ai_score: null,
    }]);
    (prisma.rawProject.update as jest.Mock).mockResolvedValue({});
    (prisma.integration.findMany as jest.Mock).mockResolvedValue([
      { provider: "velog" },
    ]);
    (prisma.portfolio.findFirst as jest.Mock).mockResolvedValue({ slug: "hong" });
    (prisma.portfolioBlock.deleteMany as jest.Mock).mockResolvedValue({ count: 4 });
    (prisma.portfolioBlock.createMany as jest.Mock).mockResolvedValue({ count: 5 });
    (prisma.portfolio.update as jest.Mock).mockResolvedValue({});
    (prisma.$transaction as jest.Mock).mockImplementation(
      async (callback: (tx: typeof prisma) => Promise<unknown>) => callback(prisma),
    );
  });

  it("atomically replaces blocks with factual summaries and a final contact block", async () => {
    await generatePortfolio({
      jobId: "job-1",
      portfolioId: "portfolio-1",
      userId: "user-1",
      autoPublish: true,
    });

    const summary = JSON.parse(
      (prisma.rawProject.update as jest.Mock).mock.calls[0][0].data.ai_summary,
    );
    expect(summary).toEqual(expect.objectContaining({
      headline: "payments-api 저장소의 구현 내용과 구조를 확인할 수 있습니다.",
      role: null,
    }));
    expect(JSON.stringify(summary)).not.toContain("신뢰도 높은");

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.portfolioBlock.deleteMany).toHaveBeenCalledWith({
      where: { portfolio_id: "portfolio-1" },
    });
    const blocks = (prisma.portfolioBlock.createMany as jest.Mock).mock.calls[0][0].data;
    expect(blocks.map((block: { position: number }) => block.position)).toEqual([0, 1, 2, 3, 4]);
    expect(blocks.map((block: { block_type: string }) => block.block_type)).toEqual([
      "hero",
      "project_grid",
      "skills",
      "blog_feed",
      "contact",
    ]);
    expect(blocks.at(-1).config).toEqual({});
    expect((prisma.portfolioBlock.deleteMany as jest.Mock).mock.invocationCallOrder[0])
      .toBeLessThan((prisma.portfolioBlock.createMany as jest.Mock).mock.invocationCallOrder[0]);
    expect(prisma.portfolio.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "portfolio-1" },
    }));

    const finalJob = JSON.parse(
      (redis.set as jest.Mock).mock.calls.at(-1)[1] as string,
    );
    expect(finalJob).toEqual(expect.objectContaining({
      status: "completed",
      missing_optional_fields: ["email", "linkedin_url", "website_url"],
    }));
  });
});
