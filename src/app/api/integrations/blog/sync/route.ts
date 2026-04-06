import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parseBlogRSS, resolveRSSUrl } from "@/lib/rss";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { url, portfolio_id, block_id } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "URL이 필요합니다." }, { status: 400 });
    }

    // 1. RSS URL 확인 및 공급자 판별
    const rssUrl = resolveRSSUrl(url);
    const provider = rssUrl.includes("velog.io") ? "velog" : "tistory";

    // 2. 블로그 피드 파싱
    const posts = await parseBlogRSS(rssUrl);

    // 3. DB 통합 정보 저장 (Integration)
    const integration = await prisma.integration.upsert({
      where: {
        user_id_provider: {
          user_id: session.user.id,
          provider: provider,
        },
      },
      update: {
        metadata: { rss_url: rssUrl, blog_url: url },
        synced_at: new Date(),
      },
      create: {
        user_id: session.user.id,
        provider: provider,
        metadata: { rss_url: rssUrl, blog_url: url },
        synced_at: new Date(),
      },
    });

    // 4. 피드 아이템 일괄 저장 (Transaction)
    await prisma.$transaction(
      posts.map((post) =>
        prisma.feedItem.upsert({
          where: { id: post.id }, // guid는 전역 유니크하다고 가정
          update: {
            title: post.title,
            url: post.link,
            published_at: new Date(post.pubDate),
            metadata: {
              snippet: post.snippet,
              thumbnail: post.thumbnail,
            },
          },
          create: {
            id: post.id,
            user_id: session.user.id,
            integration_id: integration.id,
            item_type: "blog_post",
            title: post.title,
            url: post.link,
            published_at: new Date(post.pubDate),
            metadata: {
              snippet: post.snippet,
              thumbnail: post.thumbnail,
            },
          },
        })
      )
    );

    // 5. 포트폴리오 블록 설정 업데이트 (선택 사항)
    if (portfolio_id && block_id) {
      const block = await prisma.portfolioBlock.findUnique({
        where: { id: block_id },
      });

      if (block && block.portfolio_id === portfolio_id) {
        await prisma.portfolioBlock.update({
          where: { id: block_id },
          data: {
            config: {
              ...(block.config as object),
              integration_provider: provider,
              rss_url: rssUrl,
              blog_url: url,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      provider,
      rssUrl,
      count: posts.length,
    });
  } catch (error: any) {
    console.error("[BLOG_SYNC_POST]", error);
    return NextResponse.json(
      { error: error.message || "동기화에 실패했습니다." },
      { status: 500 }
    );
  }
}
