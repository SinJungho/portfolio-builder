import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { redis } from "@/lib/redis";

const CACHE_TTL = 300; // 5분
const DOMAIN_CACHE_KEY = (domain: string) => `domain_mapping:${domain}`;

/**
 * 도메인 호스트명을 기반으로 포트폴리오 슬러그 해석 (GET)
 * - Middleware에서 호출하는 공개 엔드포인트
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    // 1. Redis 캐시 확인
    const cachedSlug = await redis.get<string>(DOMAIN_CACHE_KEY(domain));
    if (cachedSlug) {
      return NextResponse.json({ slug: cachedSlug, source: "cache" });
    }

    // 2. DB 조회 (Prisma)
    const portfolio = await prisma.portfolio.findFirst({
      where: {
        custom_domain: domain,
        is_published: true, // 발행된 포트폴리오만 매핑
      },
      select: { slug: true },
    });

    if (!portfolio) {
      return NextResponse.json({ error: "domain not found" }, { status: 404 });
    }

    // 3. Redis 캐시 저장
    await redis.set(DOMAIN_CACHE_KEY(domain), portfolio.slug, { ex: CACHE_TTL });

    return NextResponse.json({ slug: portfolio.slug, source: "database" });
  } catch (error) {
    console.error("GET /api/domains/resolve error:", error);
    const message = error instanceof Error ? error.message : "internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
