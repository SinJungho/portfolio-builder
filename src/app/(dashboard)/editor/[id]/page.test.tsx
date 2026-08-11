import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import EditorPage from "./page";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    portfolio: { findFirst: jest.fn() },
    portfolioBlock: { findMany: jest.fn() },
  },
}));
jest.mock("next/navigation", () => ({
  notFound: jest.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));
jest.mock("./EditorClient", () => ({ __esModule: true, default: () => null }));

describe("EditorPage ownership", () => {
  beforeEach(() => jest.clearAllMocks());

  it("filters the requested portfolio by the authenticated owner", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "owner-1" } });
    (prisma.portfolio.findFirst as jest.Mock).mockResolvedValue({
      id: "portfolio-1",
      slug: "owner",
      custom_domain: null,
      theme: "minimal",
      design_tokens: {},
      is_published: false,
    });
    (prisma.portfolioBlock.findMany as jest.Mock).mockResolvedValue([]);

    await EditorPage({ params: Promise.resolve({ id: "portfolio-1" }) });

    expect(prisma.portfolio.findFirst).toHaveBeenCalledWith({
      where: { id: "portfolio-1", user_id: "owner-1" },
    });
  });

  it("does not query portfolio data without a session", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    await expect(EditorPage({ params: Promise.resolve({ id: "portfolio-1" }) }))
      .rejects.toThrow("NEXT_NOT_FOUND");
    expect(prisma.portfolio.findFirst).not.toHaveBeenCalled();
  });
});
