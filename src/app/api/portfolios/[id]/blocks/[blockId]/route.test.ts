/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { PATCH } from "./route";

jest.mock("@/lib/api/validatePortfolioOwnership", () => ({
  validatePortfolioOwnership: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolioBlock: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe("PATCH /api/portfolios/[id]/blocks/[blockId]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validatePortfolioOwnership as jest.Mock).mockResolvedValue({
      portfolio: { id: "portfolio-1", slug: null },
    });
    (prisma.portfolioBlock.findFirst as jest.Mock).mockResolvedValue({
      id: "block-1",
      block_type: "hero",
      config: {
        headline: "홍길동",
        subheadline: "백엔드 개발자",
        bio: "기존 소개",
        show_github_stats: true,
      },
    });
    (prisma.portfolioBlock.update as jest.Mock).mockResolvedValue({ id: "block-1" });
  });

  it("merges a partial config without deleting untouched fields", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/portfolios/portfolio-1/blocks/block-1", {
        method: "PATCH",
        body: JSON.stringify({ config: { bio: "수정된 소개" } }),
      }),
      { params: Promise.resolve({ id: "portfolio-1", blockId: "block-1" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.portfolioBlock.update).toHaveBeenCalledWith({
      where: { id: "block-1" },
      data: {
        config: {
          headline: "홍길동",
          subheadline: "백엔드 개발자",
          bio: "수정된 소개",
          show_github_stats: true,
        },
      },
    });
  });

  it("rejects an empty update", async () => {
    const response = await PATCH(
      new Request("http://localhost/api/portfolios/portfolio-1/blocks/block-1", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
      { params: Promise.resolve({ id: "portfolio-1", blockId: "block-1" }) },
    );

    expect(response.status).toBe(400);
    expect(prisma.portfolioBlock.findFirst).not.toHaveBeenCalled();
  });
});
