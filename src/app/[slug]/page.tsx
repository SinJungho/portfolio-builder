import AnalyticsTracker from "@/components/AnalyticsTracker";
import { prisma } from "@/lib/prisma";
import PortfolioPreview from "@/preview/PortfolioPreview";
import { resolveTheme } from "@/preview/themes";
import { portfolioService } from "@/services/portfolio";
import type { Metadata } from "next";
import Link from "next/link";
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
      `${portfolio.user?.name || slug}'s Portfolio`,
    description:
      portfolio.seo_description ||
      "PortfolioForge로 생성된 프리미엄 포트폴리오입니다.",
    openGraph: {
      images: portfolio.og_image_url ? [portfolio.og_image_url] : [],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PortfolioPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { export: isExport } = await searchParams;
  const isExportMode = isExport === "true";

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
        backgroundImage: t.pageBgGradient || "none",
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
            url: `https://${portfolio.slug}.portfolioforge.app`,
            description: portfolio.seo_description || portfolio.title,
            image: portfolio.og_image_url || undefined,
          }),
        }}
      />

      <main className="flex-1 w-full">
        <PortfolioPreview
          blocks={blocks}
          theme={portfolio.theme}
          designTokens={portfolio.design_tokens as Record<string, unknown>}
          slug={portfolio.slug}
          portfolioId={portfolio.id}
        />
      </main>

      {!isExportMode && (
        <footer
          className="py-10 px-6 print:hidden"
          style={{ backgroundColor: t.footerBg }}
        >
          <div className="max-w-[960px] mx-auto flex flex-col items-center gap-3 text-center">
            <p
              className="text-[13px] font-medium"
              style={{ color: t.footerText }}
            >
              © {new Date().getFullYear()} {portfolio.title || slug}
            </p>
            <Link
              href="/"
              className="text-[11px] font-bold uppercase tracking-[2px] transition-colors duration-200 hover:opacity-70"
              style={{ color: t.textMuted }}
            >
              Powered by PortfolioForge
            </Link>
          </div>
        </footer>
      )}
    </div>
  );
}

