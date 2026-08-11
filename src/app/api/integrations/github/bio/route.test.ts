/** @jest-environment node */

import { GET } from "./route";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

jest.mock("@/auth", () => ({ auth: jest.fn() }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
    integration: { findUnique: jest.fn() },
    account: { findFirst: jest.fn() },
  },
}));
jest.mock("@/lib/utils/security", () => ({
  safeDecrypt: (token?: string | null) => token ?? "",
}));

describe("GET /api/integrations/github/bio", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue({ user: { id: "user-1" } });
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ github_bio: null });
    (prisma.integration.findUnique as jest.Mock).mockResolvedValue({ access_token: "stale-token" });
    (prisma.account.findFirst as jest.Mock).mockResolvedValue({ access_token: "fresh-token" });
    global.fetch = jest.fn();
  });

  it("retries with the account token after the integration token is rejected", async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(Response.json({ bio: "Fresh bio" }));

    const response = await GET();

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ bio: "Fresh bio", exists: true });
    expect(global.fetch).toHaveBeenNthCalledWith(1, expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer stale-token" }),
    }));
    expect(global.fetch).toHaveBeenNthCalledWith(2, expect.any(String), expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer fresh-token" }),
    }));
    expect(prisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
      data: { github_bio: "Fresh bio", github_bio_verified: true },
    }));
  });

  it("returns an expired-auth error when both tokens are rejected", async () => {
    (global.fetch as jest.Mock).mockResolvedValue(new Response(null, { status: 401 }));

    const response = await GET();

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      code: "GITHUB_AUTH_EXPIRED",
      error: "GitHub 연동 정보가 만료되었어요.",
    });
    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});
