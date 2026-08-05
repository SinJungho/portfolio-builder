/** @jest-environment node */

import { POST } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    portfolio: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
    rawProject: { findMany: jest.fn() },
    integration: { findFirst: jest.fn() },
  },
}));

describe("POST /api/portfolios", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-12345" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ github_login: "portfolio-user" });
    (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.portfolio.create as jest.Mock).mockImplementation(async ({ data }) => ({
      id: "portfolio-1",
      slug: data.slug,
    }));
  });

  it("keeps malformed JSON requests compatible with the default portfolio flow", async () => {
    const logWarning = jest.spyOn(console, "warn").mockImplementation();
    const response = await POST(
      new Request("http://localhost/api/portfolios", { method: "POST", body: "{" }),
    );

    expect(response.status).toBe(201);
    expect(logWarning).toHaveBeenCalledWith(
      "[API /api/portfolios] POST received invalid JSON",
      expect.objectContaining({ name: "SyntaxError", message: expect.any(String) }),
    );
    expect(prisma.portfolio.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({
        user_id: "user-12345",
        slug: "portfolio-user",
        theme: "minimal",
      }),
    }));
    logWarning.mockRestore();
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
