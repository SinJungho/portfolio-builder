/** @jest-environment node */

import { POST } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normalizePortfolioSlug } from "@/lib/portfolio-url";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    portfolio: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn(), findMany: jest.fn() },
    rawProject: { findMany: jest.fn() },
    integration: { findFirst: jest.fn() },
  },
}));

describe("POST /api/portfolios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-12345" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ github_login: "portfolio-user" });
    (prisma.portfolio.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.portfolio.create as jest.Mock).mockImplementation(async ({ data }) => ({
      id: "portfolio-1",
      slug: data.slug,
    }));
  });

  it("rejects malformed JSON instead of silently creating a default portfolio", async () => {
    const logWarning = jest.spyOn(console, "warn").mockImplementation();
    const response = await POST(
      new Request("http://localhost/api/portfolios", { method: "POST", body: "{" }),
    );

    expect(response.status).toBe(400);
    expect(logWarning).toHaveBeenCalledWith(
      "[API /api/portfolios] POST received invalid JSON",
      expect.objectContaining({ name: "SyntaxError", message: expect.any(String) }),
    );
    expect(prisma.portfolio.create).not.toHaveBeenCalled();
    logWarning.mockRestore();
  });

  it("긴 slug가 충돌해도 조회 가능한 길이(50자)를 넘지 않는다", async () => {
    const longSlug = "a".repeat(50);
    // 첫 후보는 이미 사용 중, 두 번째 후보에서 통과시킨다.
    (prisma.portfolio.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: "taken" })
      .mockResolvedValue(null);

    const response = await POST(
      new Request("http://localhost/api/portfolios", {
        method: "POST",
        body: JSON.stringify({ slug: longSlug }),
      }),
    );

    expect(response.status).toBe(201);
    const created = (prisma.portfolio.create as jest.Mock).mock.calls[0][0].data.slug;
    expect(created.length).toBeLessThanOrEqual(50);
    // 저장한 값이 정규화 후에도 그대로여야 공개 페이지에서 다시 찾을 수 있다.
    expect(normalizePortfolioSlug(created)).toBe(created);
  });

  it("logs internal errors while returning the shared user message", async () => {
    const error = new Error("database unavailable");
    const logError = jest.spyOn(console, "error").mockImplementation();
    (prisma.user.findUnique as jest.Mock).mockRejectedValue(error);

    const response = await POST(
      new Request("http://localhost/api/portfolios", { method: "POST", body: "{}" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      code: "INTERNAL_ERROR",
      error: "요청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.",
    });
    expect(logError).toHaveBeenCalledWith(
      "[API /api/portfolios] POST failed",
      expect.objectContaining({
        name: "Error",
        message: "database unavailable",
        stack: expect.any(String),
      }),
    );
    logError.mockRestore();
  });
});
