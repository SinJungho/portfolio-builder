/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { portfolioService } from "./portfolio";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolio: { findUnique: jest.fn() },
    portfolioBlock: { findMany: jest.fn() },
    rawProject: { findMany: jest.fn(), aggregate: jest.fn() },
    feedItem: { findMany: jest.fn() },
  },
}));

describe("PortfolioService public population", () => {
  it("never populates project IDs from another user's raw project records", async () => {
    (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue({
      id: "portfolio-1",
      user_id: "owner-1",
      slug: "owner",
      title: null,
      theme: "minimal",
      design_tokens: {},
      seo_title: null,
      seo_description: null,
      og_image_url: null,
      custom_domain: null,
      is_published: true,
      user: { name: "홍길동", github_login: "owner" },
    });
    (prisma.portfolioBlock.findMany as jest.Mock).mockResolvedValue([{
      id: "block-1",
      portfolio_id: "portfolio-1",
      block_type: "project_grid",
      position: 0,
      config: { project_ids: ["project-1"] },
      is_visible: true,
      is_ai_generated: false,
    }]);
    (prisma.rawProject.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.rawProject.aggregate as jest.Mock).mockResolvedValue({
      _count: { id: 0 },
      _sum: { stargazers_count: null },
    });

    await portfolioService.getPopulatedPortfolioBySlug("owner");

    expect(prisma.rawProject.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["project-1"] }, user_id: "owner-1" },
    });
  });

  it("LIKE 와일드카드를 담은 slug로는 아무 포트폴리오도 매칭하지 않는다", async () => {
    (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue(null);

    await portfolioService.getPopulatedPortfolioBySlug("%");
    await portfolioService.getPopulatedPortfolioBySlug("a_c");

    // 정확 일치 조회여야 하고, LIKE 패턴 문자는 정규화 단계에서 사라진다.
    expect(prisma.portfolio.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "" } }),
    );
    expect(prisma.portfolio.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "a-c" } }),
    );
  });
});
