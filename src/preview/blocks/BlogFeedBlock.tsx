"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ThemeTokens } from "../themes";
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal";

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

  const displayFeed =
    feed_items.length > 0
      ? feed_items.slice(0, max_items)
      : [
          { id: "1", title: "최근 프로젝트 리뷰: Next.js와 SSR", url: "#", published_at: new Date(), metadata: {} },
          { id: "2", title: "React 상태 관리 패턴 비교", url: "#", published_at: new Date(), metadata: {} },
          { id: "3", title: "개발자의 성장 일기", url: "#", published_at: new Date(), metadata: {} },
        ].slice(0, max_items);

  const providerLabels: Record<string, string> = {
    tistory: "Tistory",
    velog: "Velog",
    medium: "Medium",
    custom_rss: "Blog",
  };

  const providerLabel = providerLabels[integration_provider] || "Blog";
  const { ref: headerRef, style: headerStyle } = useScrollReveal("fadeUp");
  const feedReveals = useStaggerReveal<HTMLAnchorElement>(displayFeed.length, "fadeUp");

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div ref={headerRef} style={headerStyle} className="space-y-4">
        <div className="flex items-end gap-4">
          <h2
            className="text-[28px] md:text-[36px] font-extrabold tracking-[-2px] leading-none"
            style={{ color: t.text }}
          >
            Recent Articles
          </h2>
          <span
            className="text-[14px] font-semibold mb-1"
            style={{ color: t.textMuted }}
          >
            from {providerLabel}
          </span>
        </div>
        <div
          className="h-[3px] w-12 rounded-full"
          style={{ background: t.decorBar }}
        />
      </div>

      {/* Feed List */}
      <div className="flex flex-col gap-4">
        {displayFeed.map((item, idx) => {
          const { ref: revealRef, style: revealStyle } = feedReveals[idx];
          const thumbnail = item.metadata
            ? (item.metadata as Record<string, string>).thumbnail
            : undefined;

          return (
            <Link
              key={item.id}
              ref={revealRef}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-6 p-5 md:p-6 transition-all duration-500 hover:-translate-y-0.5"
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = t.cardHoverBorder;
                e.currentTarget.style.boxShadow = t.cardHoverShadow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = t.cardBorder;
                e.currentTarget.style.boxShadow = t.cardShadow;
              }}
              style={{
                ...revealStyle,
                backgroundColor: t.cardBg,
                border: `1px solid ${t.cardBorder}`,
                borderRadius: t.cardRadius,
                boxShadow: t.cardShadow,
              }}
            >
              {/* Thumbnail */}
              {show_thumbnail && thumbnail && (
                <div className="relative w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-2xl overflow-hidden">
                  <Image
                    src={thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-2">
                <p
                  className="text-[12px] font-bold uppercase tracking-[1.5px]"
                  style={{ color: t.accent }}
                >
                  {providerLabel}
                </p>
                <h3
                  className="font-bold text-[17px] md:text-[18px] leading-snug truncate tracking-[-0.3px]"
                  style={{ color: t.text }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: t.textMuted }}
                >
                  {new Date(item.published_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Arrow */}
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ background: t.accentGradient }}
              >
                <ArrowUpRight size={16} color="#fff" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
