"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Rss } from "lucide-react";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface BlogFeedBlockProps {
  config: {
    integration_provider: "tistory" | "velog" | "medium" | "custom_rss";
    max_items: number;
    show_thumbnail: boolean;
    feed_items?: Array<{
      id: string;
      title: string;
      url: string;
      published_at: Date;
      metadata?: Record<string, unknown>;
    }>;
  };
  theme: ThemeTokens;
}

export default function BlogFeedBlock({ config, theme: t }: BlogFeedBlockProps) {
  const { integration_provider, max_items, show_thumbnail, feed_items = [] } = config;

  const hasItems = feed_items.length > 0;
  
  // 연동 전 가이드용 더미 데이터
  const dummyFeed = [
    { id: "1", title: "최근 프로젝트 리뷰: Next.js와 SSR", url: "#", published_at: new Date(), metadata: { snippet: "Next.js의 서버 사이드 렌더링이 비즈니스 성장에 미치는 영향에 대해 심도 있게 다뤄보았습니다..." } },
    { id: "2", title: "React 상태 관리 패턴 비교", url: "#", published_at: new Date(), metadata: { snippet: "Zustand, Recoil, Redux 중 우리 팀에 맞는 도구는 무엇일까요? 각 라이브러리의 장단점을 분석합니다." } },
    { id: "3", title: "개발자의 성장 일기: 기록의 힘", url: "#", published_at: new Date(), metadata: { snippet: "매일매일의 배움을 기록하는 습관이 어떻게 저를 성장시켰는지, 그 과정에서 얻은 인사이트를 공유합니다." } },
  ].slice(0, max_items);

  const displayFeed = hasItems ? feed_items.slice(0, max_items) : dummyFeed;

  const providerLabels: Record<string, string> = {
    tistory: "Tistory",
    velog: "Velog",
    medium: "Medium",
    custom_rss: "Blog",
  };

  const providerLabel = providerLabels[integration_provider] || "Blog";
  const header = useScrollReveal("fadeUp");

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div ref={header.ref} style={header.style} className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-x-6 gap-y-3">
          <h2
            className="text-[32px] md:text-[42px] font-extrabold tracking-[-2.5px] leading-none"
            style={{ color: t.text }}
          >
            Latest Stories
          </h2>
          {hasItems && (
            <div className="flex items-center gap-2 mb-1 px-3 py-1.5 rounded-full border border-black/5 bg-gray-50/50">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: t.textMuted }}>
                Synced from {providerLabel}
              </span>
            </div>
          )}
        </div>
        <div
          className="h-[4px] w-14 rounded-full"
          style={{ background: t.accentGradient }}
        />
      </div>

      {/* Feed List or Empty State */}
      {!hasItems && (
        <div className="p-10 border border-dashed border-gray-200 rounded-[32px] flex flex-col items-center text-center gap-4 bg-gray-50/30 opacity-60 grayscale-[0.5]">
           <Rss className="w-10 h-10 text-gray-300" />
           <div className="space-y-1">
             <p className="font-bold text-[16px] text-gray-500">블로그 소식을 연동해 보세요</p>
             <p className="text-[14px] font-medium text-gray-400">에디터에서 Velog나 Tistory 주소를 입력하면 글 목록이 나타납니다.</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayFeed.map((item, idx) => {
          const reveal = useScrollReveal<HTMLAnchorElement>("fadeUp", { delay: idx * 100 });
          const metadata = item.metadata as any;
          // 1. 이미지 추출 (content:encoded 또는 description에서 첫 번째 img 태그)
          const itemAny = item as any;
          const content = itemAny.contentEncoded || itemAny.content || itemAny.description || "";
          const thumbnail = metadata?.thumbnail;
          const snippet = metadata?.snippet;

          return (
            <Link
              key={item.id}
              ref={reveal.ref}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col p-8 transition-all duration-500 border border-black/[0.04]"
              style={{
                ...reveal.style,
                backgroundColor: t.cardBg,
                borderRadius: t.cardRadius,
                boxShadow: t.cardShadow,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.cardHoverBorder;
                e.currentTarget.style.transform = "translateY(-6px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Thumbnail (Optional) */}
              {show_thumbnail && thumbnail && (
                <div className="relative aspect-video w-full mb-6 rounded-2xl overflow-hidden bg-gray-100">
                  <Image
                    src={thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>
              )}

              {/* Icon & Provider */}
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="text-[11px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md"
                  style={{ backgroundColor: t.accentSoft, color: t.accent }}
                >
                  {providerLabel}
                </span>
                <ArrowUpRight className="w-4.5 h-4.5 text-gray-300 group-hover:text-gray-900 transition-colors" />
              </div>

              {/* Text Content */}
              <div className="flex-1 space-y-3">
                <h3
                  className="font-bold text-[20px] leading-[1.4] tracking-tight group-hover:underline decoration-offset-4 decoration-2"
                  style={{ color: t.text }}
                >
                  {item.title}
                </h3>
                {snippet && (
                  <p
                    className="text-[14px] font-medium leading-relaxed line-clamp-3"
                    style={{ color: t.textMuted }}
                  >
                    {snippet}
                  </p>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-8 pt-6 border-t border-black/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                     <span className="text-[10px] font-bold text-gray-400">#</span>
                   </div>
                   <span className="text-[13px] font-bold" style={{ color: t.textMuted }}>
                      Reading
                   </span>
                </div>
                <time
                  className="text-[12px] font-bold"
                  style={{ color: t.textMuted }}
                >
                  {new Date(item.published_at).toLocaleDateString("ko-KR", {
                    month: "long",
                    day: "numeric",
                  })}
                </time>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
