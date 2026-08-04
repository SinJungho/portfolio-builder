"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ThemeTokens } from "../themes";

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

// 썸네일 로드에 실패하면 이미지를 숨긴다.
function BlogThumbnail({ src, alt, radius }: { src: string; alt: string; radius: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div
      className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 overflow-hidden"
      style={{ borderRadius: radius }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        unoptimized
        onError={() => setFailed(true)}
      />
    </div>
  );
}

export default function BlogFeedBlock({ config, theme: t }: BlogFeedBlockProps) {
  const { integration_provider, max_items, show_thumbnail, feed_items = [] } = config;

  const displayFeed = feed_items.slice(0, max_items);

  const providerLabels: Record<string, string> = {
    tistory: "Tistory",
    velog: "Velog",
    medium: "Medium",
    custom_rss: "블로그", // 일반 RSS 제공자
  };

  const providerLabel = providerLabels[integration_provider] || "블로그";

  if (displayFeed.length === 0) return null;

  return (
    <section className="space-y-12">
      {/* 섹션 제목과 제공자를 표시한다. */}
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <h2
            className="text-[28px] md:text-[36px] font-extrabold tracking-[-1px] leading-none"
            style={{ color: t.text }}
          >
            최신 글
          </h2>
          <span
            className="text-[14px] font-semibold mb-1"
            style={{ color: t.textMuted }}
          >
            {providerLabel} 글
          </span>
        </div>
      </div>

      {/* 피드 항목을 구분선 목록으로 렌더링한다. */}
      <div style={{ borderTop: `1px solid ${t.cardBorder}` }}>
        {displayFeed.map((item) => {
          const thumbnail = item.metadata
            ? (item.metadata as Record<string, string>).thumbnail
            : undefined;

          return (
            <Link
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex items-center gap-5 py-5 focus-visible:outline-2 focus-visible:outline-offset-4"
              style={{ borderBottom: `1px solid ${t.cardBorder}`, outlineColor: t.accent }}
            >
              {/* 제목과 제공자·게시일을 표시한다. */}
              <div className="flex-1 min-w-0 space-y-1.5">
                <h3
                  className="font-bold text-[17px] md:text-[18px] leading-snug line-clamp-2 tracking-[-0.3px] group-hover:underline decoration-1 underline-offset-4"
                  style={{ color: t.text }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-[13px] font-medium"
                  style={{ color: t.textMuted }}
                >
                  {providerLabel} · {new Date(item.published_at).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* 썸네일은 오른쪽에 배치해 제목 정렬을 유지한다. */}
              {show_thumbnail && thumbnail && (
                <BlogThumbnail src={thumbnail} alt={item.title} radius={t.cardRadius} />
              )}

              <ArrowUpRight
                size={18}
                className="shrink-0 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                color={t.textMuted}
              />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
