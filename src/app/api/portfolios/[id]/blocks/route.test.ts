/** @jest-environment node */

import { POST, PUT } from "./route";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { prisma } from "@/lib/prisma";

jest.mock("@/lib/api/validatePortfolioOwnership", () => ({
  validatePortfolioOwnership: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolioBlock: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
    user: {
      findUnique: jest.fn(),
    },
  },
}));
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

describe("POST /api/portfolios/[id]/blocks", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (validatePortfolioOwnership as jest.Mock).mockResolvedValue({
      portfolio: { id: "portfolio-1", user_id: "user-1", slug: "portfolio" },
    });
    (prisma.portfolioBlock.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.portfolioBlock.count as jest.Mock).mockResolvedValue(0);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      name: "신정호",
      github_login: "SinJungho",
      github_bio: "제품을 만드는 프론트엔드 개발자",
    });
    (prisma.portfolioBlock.create as jest.Mock).mockImplementation(async ({ data }) => ({
      id: "block-1",
      ...data,
    }));
  });

  it("creates a hero draft from the user's GitHub profile", async () => {
    const response = await POST(
      new Request("http://localhost/api/portfolios/portfolio-1/blocks", {
        method: "POST",
        body: JSON.stringify({ block_type: "hero" }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(201);
    expect(prisma.portfolioBlock.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        config: {
          headline: "신정호",
          subheadline: "제품을 만드는 프론트엔드 개발자",
          bio: "제품을 만드는 프론트엔드 개발자",
          show_github_stats: true,
        },
      }),
    }));
  });

  it("keeps invalid reorder payloads as validation errors", async () => {
    const logWarning = jest.spyOn(console, "warn").mockImplementation();
    const response = await PUT(
      new Request("http://localhost/api/portfolios/portfolio-1/blocks", {
        method: "PUT",
        body: "{",
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      code: "INVALID_REQUEST",
      error: "요청 형식이 올바르지 않아요.",
    });
    expect(logWarning).toHaveBeenCalledWith(
      "[API /api/portfolios/[id]/blocks] PUT received invalid JSON",
      expect.objectContaining({ name: "SyntaxError", message: expect.any(String) }),
    );
    expect(prisma.portfolioBlock.findMany).not.toHaveBeenCalled();
    logWarning.mockRestore();
  });

  it("logs internal errors while returning the shared user message", async () => {
    const error = new Error("database unavailable");
    const logError = jest.spyOn(console, "error").mockImplementation();
    (prisma.portfolioBlock.findFirst as jest.Mock).mockRejectedValue(error);

    const response = await POST(
      new Request("http://localhost/api/portfolios/portfolio-1/blocks", {
        method: "POST",
        body: JSON.stringify({ block_type: "hero" }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "INTERNAL_ERROR",
      error: "요청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
    });
    expect(logError).toHaveBeenCalledWith(
      "[API /api/portfolios/[id]/blocks] POST failed",
      expect.objectContaining({
        name: "Error",
        message: "database unavailable",
        stack: expect.any(String),
      }),
    );
    logError.mockRestore();
  });
});
