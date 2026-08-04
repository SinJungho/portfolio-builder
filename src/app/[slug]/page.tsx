import AnalyticsTracker from "@/components/AnalyticsTracker";
import { prisma } from "@/lib/prisma";
import { portfolioUrl } from "@/lib/portfolio-url";
import PortfolioPreview from "@/preview/PortfolioPreview";
import { resolveTheme } from "@/preview/themes";
import { portfolioService } from "@/services/portfolio";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ export?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const portfolio = await prisma.portfolio.findFirst({
    where: { slug },
    select: {
      title: true,
      slug: true,
      is_published: true,
      seo_title: true,
      seo_description: true,
      og_image_url: true,
      user: {
        select: { name: true },
      },
    },
  });

  if (!portfolio || !portfolio.is_published) return {};

  return {
    title:
      portfolio.seo_title ||
      portfolio.title ||
      `${portfolio.user?.name || slug} 포트폴리오`,
    description:
      portfolio.seo_description ||
      `${portfolio.user?.name || slug}님의 개발 포트폴리오 — 프로젝트와 기술 스택을 한눈에 소개합니다.`,
    openGraph: {
      images: portfolio.og_image_url ? [portfolio.og_image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PortfolioPage({ params }: Props) {
  const { slug } = await params;

  // 포트폴리오 데이터와 모든 블록 구성 요소를 한 번에 가공하여 조회합니다. (N+1 쿼리 최적화 내장)
  const data = await portfolioService.getPopulatedPortfolioBySlug(slug);

  if (!data) {
    notFound();
  }

  const { portfolio, blocks } = data;
  const t = resolveTheme(portfolio.theme);

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{
        backgroundColor: t.bg,
        color: t.text,
      }}
    >
      <AnalyticsTracker portfolioId={portfolio.id} />

      {/* 포트폴리오 검색 엔진 및 크롤러용 JSON-LD 구조화 데이터 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: portfolio.user?.name || slug,
            // 커스텀 도메인 반영 — 하드코딩된 서브도메인은 커스텀 도메인 사용자에게 틀린 canonical URL이었음
            url: portfolioUrl(portfolio.slug, portfolio.custom_domain),
            description: portfolio.seo_description || portfolio.title,
            image: portfolio.og_image_url || undefined,
          }),
        }}
      />

      {/* 단일 <main> 랜드마크 — 포트폴리오 자체 푸터("포지로 만든 포트폴리오")는 PortfolioPreview가 렌더 */}
      <main className="flex-1 w-full">
        <PortfolioPreview
          blocks={blocks}
          theme={portfolio.theme}
          designTokens={portfolio.design_tokens as Record<string, unknown>}
          slug={portfolio.slug}
          portfolioId={portfolio.id}
        />
      </main>
    </div>
  );
}

