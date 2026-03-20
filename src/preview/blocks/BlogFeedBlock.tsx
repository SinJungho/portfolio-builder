import React from "react";
import Image from "next/image";

interface BlogFeedBlockProps {
  config: {
    integration_provider: "tistory" | "velog" | "medium" | "custom_rss";
    max_items: number;
    show_thumbnail: boolean;
    // Server component pass feed data or we fetch inside component.
    // For MVP SSR, we assume `feed_items` array is passed.
    feed_items?: Array<{
      id: string;
      title: string;
      url: string;
      published_at: Date;
      metadata?: Record<string, unknown>;
    }>;
  };
}

export default function BlogFeedBlock({ config }: BlogFeedBlockProps) {
  const { integration_provider, max_items, show_thumbnail, feed_items = [] } = config;

  // Placeholder items if no real data is passed (e.g. dev mode or empty connection)
  const displayFeed = feed_items.length > 0 
    ? feed_items.slice(0, max_items)
    : [
        { id: "1", title: "최근 프로젝트 리뷰: Next.js와 SSR", url: "#", published_at: new Date(), metadata: {} },
        { id: "2", title: "React 상태 관리 패턴 비교", url: "#", published_at: new Date(), metadata: {} },
        { id: "3", title: "개발자의 성장 일기", url: "#", published_at: new Date(), metadata: {} },
      ].slice(0, max_items);

  const providerLabels = {
    tistory: "Tistory",
    velog: "Velog",
    medium: "Medium",
    custom_rss: "Blog",
  };

  const providerLabel = providerLabels[integration_provider] || "Blog";

  return (
    <section className="space-y-12">
      <div className="space-y-2 text-center md:text-left">
        <h2 className="text-[32px] font-extrabold tracking-[-1.5px] text-current leading-tight">
          Recent Articles from <span className="opacity-40">{providerLabel}</span>
        </h2>
        <div className="h-1.5 w-12 bg-current/20 rounded-full mx-auto md:mx-0" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayFeed.map((item) => {
          const thumbnail = item.metadata ? (item.metadata as Record<string, string>).thumbnail : undefined;

          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col p-6 rounded-[32px] border border-current/10 bg-current/2 hover:bg-current/4 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden"
            >
              {show_thumbnail && thumbnail && (
                <div className="shrink-0 relative w-full aspect-video rounded-[20px] overflow-hidden border border-current/5 mb-6 group-hover:border-current/10 transition-colors">
                  <Image
                    src={thumbnail}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    unoptimized
                  />
                </div>
              )}
              <div className="flex-1 space-y-4">
                <h3 className="font-extrabold text-xl line-clamp-2 leading-tight tracking-[-0.5px] group-hover:text-blue-500 transition-colors">
                  {item.title}
                </h3>
                <div className="text-[13px] opacity-40 font-bold uppercase tracking-wider">
                  {new Date(item.published_at).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </section>
  );
}
