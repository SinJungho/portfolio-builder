/** @jest-environment node */

import { PUT } from "./route";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/api/validatePortfolioOwnership", () => ({
  validatePortfolioOwnership: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolio: { update: jest.fn() },
    portfolioBlock: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

const block = {
  id: "11111111-1111-4111-8111-111111111111",
  block_type: "hero",
  position: 0,
  config: {
    headline: "지원자",
    subheadline: "제품을 만드는 개발자",
    bio: "사용자 문제를 해결합니다.",
    show_github_stats: true,
  },
  is_visible: true,
  is_ai_generated: false,
};

describe("PUT /api/portfolios/[id]/snapshot", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validatePortfolioOwnership as jest.Mock).mockResolvedValue({
      portfolio: { id: "portfolio-1", slug: "portfolio" },
    });
    (prisma.portfolioBlock.findMany as jest.Mock).mockResolvedValue([block]);
    (prisma.portfolioBlock.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.$transaction as jest.Mock).mockImplementation(async (callback: (tx: typeof prisma) => unknown) => callback(prisma));
  });

  it("restores a validated published snapshot atomically", async () => {
    const response = await PUT(
      new Request("http://localhost/api/portfolios/portfolio-1/snapshot", {
        method: "PUT",
        body: JSON.stringify({
          theme: "minimal",
          design_tokens: {},
          blocks: [block],
        }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.portfolio.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "portfolio-1" },
      data: expect.objectContaining({ theme: "minimal" }),
    }));
    expect(prisma.portfolioBlock.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: block.id },
    }));
  });

  it("rejects duplicate block ids before changing data", async () => {
    const response = await PUT(
      new Request("http://localhost/api/portfolios/portfolio-1/snapshot", {
        method: "PUT",
        body: JSON.stringify({
          theme: "minimal",
          design_tokens: {},
          blocks: [block, block],
        }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it("rejects a snapshot that bypasses the block-specific config schema", async () => {
    const response = await PUT(
      new Request("http://localhost/api/portfolios/portfolio-1/snapshot", {
        method: "PUT",
        body: JSON.stringify({
          theme: "minimal",
          design_tokens: {},
          blocks: [{ ...block, config: { headline: "필수 필드 누락" } }],
        }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(400);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });
});
