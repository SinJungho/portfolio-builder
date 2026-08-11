/** @jest-environment node */

import { prisma } from "@/lib/prisma";
import { projectService } from "@/services/project";
import { NextRequest } from "next/server";
import { POST } from "./route";

jest.mock("@/lib/utils/security", () => ({ verifyGitHubWebhook: jest.fn(() => true) }));
jest.mock("@/lib/env", () => ({ env: { GITHUB_WEBHOOK_SECRET: "secret" } }));
jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: jest.fn() },
    portfolio: { findMany: jest.fn() },
  },
}));
jest.mock("@/services/project", () => ({ projectService: { updatePushStatus: jest.fn() } }));
jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }));

describe("POST /api/webhooks/github", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 400 for a signed push payload with missing fields", async () => {
    const response = await POST(new NextRequest("http://localhost/api/webhooks/github", {
      method: "POST",
      headers: { "x-hub-signature-256": "valid", "x-github-event": "push" },
      body: JSON.stringify({ repository: {} }),
    }));

    expect(response.status).toBe(400);
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("attributes collaborator pushes to the repository owner", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: "owner-1" });
    (prisma.portfolio.findMany as jest.Mock).mockResolvedValue([]);

    const response = await POST(new NextRequest("http://localhost/api/webhooks/github", {
      method: "POST",
      headers: { "x-hub-signature-256": "valid", "x-github-event": "push" },
      body: JSON.stringify({
        repository: { id: 42, pushed_at: "2026-08-10T00:00:00Z", owner: { id: 7 } },
        sender: { id: 99 },
      }),
    }));

    expect(response.status).toBe(200);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { github_id: BigInt(7) } });
    expect(projectService.updatePushStatus).toHaveBeenCalledWith(
      "owner-1",
      "42",
      new Date("2026-08-10T00:00:00Z"),
    );
  });
});
