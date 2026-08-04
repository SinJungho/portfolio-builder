/** @jest-environment node */

import { PATCH } from "./route";
import { auth } from "@/auth";
import { validatePortfolioOwnership } from "@/lib/api/validatePortfolioOwnership";
import { prisma } from "@/lib/prisma";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/api/validatePortfolioOwnership", () => ({
  validatePortfolioOwnership: jest.fn(),
}));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolioBlock: { findMany: jest.fn() },
    portfolio: { update: jest.fn(), findUnique: jest.fn() },
    rawProject: { findMany: jest.fn() },
  },
}));

const completeBlocks = [
  { block_type: "hero", is_visible: true, config: { headline: "개발자", subheadline: "제품을 만듭니다", bio: "사용자 문제를 해결합니다." } },
  { block_type: "project_grid", is_visible: true, config: { project_ids: ["project-1"] } },
  { block_type: "contact", is_visible: true, config: { email: "dev@example.com" } },
];

describe("PATCH /api/portfolios/[id] publication readiness", () => {
  beforeEach(() => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (validatePortfolioOwnership as jest.Mock).mockResolvedValue({
      portfolio: { id: "portfolio-1", user_id: "user-1", is_published: false },
    });
    (prisma.rawProject.findMany as jest.Mock).mockResolvedValue([{ id: "project-1" }]);
  });

  it("blocks publication and returns missing editor destinations", async () => {
    (prisma.portfolioBlock.findMany as jest.Mock).mockResolvedValue([
      { ...completeBlocks[0], config: { headline: " ", subheadline: "", bio: "" } },
      ...completeBlocks.slice(1),
    ]);

    const response = await PATCH(
      new Request("http://localhost/api/portfolios/portfolio-1", {
        method: "PATCH",
        body: JSON.stringify({ is_published: true }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual(expect.objectContaining({
      missing_items: expect.arrayContaining([
        expect.objectContaining({ id: "hero-headline", destination: "hero" }),
      ]),
    }));
    expect(prisma.portfolio.update).not.toHaveBeenCalled();
  });

  it("publishes only when every readiness requirement passes", async () => {
    (prisma.portfolioBlock.findMany as jest.Mock).mockResolvedValue(completeBlocks);
    (prisma.portfolio.update as jest.Mock).mockResolvedValue({ slug: null, is_published: true });

    const response = await PATCH(
      new Request("http://localhost/api/portfolios/portfolio-1", {
        method: "PATCH",
        body: JSON.stringify({ is_published: true }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.portfolio.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ is_published: true }),
    }));
  });

  it("accepts the spotify theme", async () => {
    (prisma.portfolio.update as jest.Mock).mockResolvedValue({ slug: null, theme: "spotify" });

    const response = await PATCH(
      new Request("http://localhost/api/portfolios/portfolio-1", {
        method: "PATCH",
        body: JSON.stringify({ theme: "spotify" }),
      }),
      { params: Promise.resolve({ id: "portfolio-1" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.portfolio.update).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ theme: "spotify" }),
    }));
  });
});
