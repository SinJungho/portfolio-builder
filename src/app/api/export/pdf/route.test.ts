/** @jest-environment node */

import { NextRequest } from "next/server";
import puppeteer from "puppeteer-core";
import { prisma } from "@/lib/prisma";
import { GET } from "./route";

jest.mock("@/lib/prisma", () => ({
  prisma: { portfolio: { findUnique: jest.fn() } },
}));
jest.mock("puppeteer-core", () => ({
  __esModule: true,
  default: { launch: jest.fn() },
}));

describe("GET /api/export/pdf", () => {
  beforeEach(() => jest.clearAllMocks());

  it("유효하지 않은 slug는 조회하지 않는다", async () => {
    const response = await GET(
      new NextRequest("http://localhost/api/export/pdf?slug=../../admin"),
    );

    expect(response.status).toBe(400);
    expect(prisma.portfolio.findUnique).not.toHaveBeenCalled();
  });

  it("공개 포트폴리오가 없으면 Chromium을 시작하지 않는다", async () => {
    (prisma.portfolio.findUnique as jest.Mock).mockResolvedValue(null);

    const response = await GET(
      new NextRequest("http://localhost/api/export/pdf?slug=valid-portfolio"),
    );

    expect(response.status).toBe(404);
    expect(puppeteer.launch).not.toHaveBeenCalled();
  });
});
