/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { POST } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolio: { findUnique: jest.fn() },
    portfolioBlock: { findFirst: jest.fn() },
    analyticsEvent: { create: jest.fn() },
  },
}));

const portfolioId = "550e8400-e29b-41d4-a716-446655440000";

describe("POST /api/analytics/event", () => {
  beforeEach(() => jest.clearAllMocks());

  it("rejects block interactions without a block target", async () => {
    const response = await POST(new Request("http://localhost/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({ event_type: "block_click", portfolio_id: portfolioId }),
    }));

    expect(response.status).toBe(400);
    expect(prisma.portfolio.findUnique).not.toHaveBeenCalled();
  });

  it("does not record events for unpublished portfolios", async () => {
    (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue({ is_published: false });
    const response = await POST(new Request("http://localhost/api/analytics/event", {
      method: "POST",
      body: JSON.stringify({ event_type: "page_view", portfolio_id: portfolioId }),
    }));

    expect(response.status).toBe(404);
    expect(prisma.analyticsEvent.create).not.toHaveBeenCalled();
  });
});
