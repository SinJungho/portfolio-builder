import { Button } from "@/components/ui/button";
import { Integration } from "@/types/integration";
import { Loader2, RefreshCw, Rss } from "lucide-react";
import React from "react";
import { BlogActiveDetails } from "./BlogActiveDetails";
import { BlogFeedForm } from "./BlogFeedForm";
import { getProviderDisplayName, getProviderStyles } from "./utils";

interface BlogIntegrationCardProps {
  blogIntegration: Integration | undefined;
  isLoading: boolean;
  isSyncing: boolean;
  isDisconnecting: boolean;
  onConnect: (url: string) => void;
  onSync: () => void;
  onDisconnect: () => void;
}

export function BlogIntegrationCard({
  blogIntegration,
  isLoading,
  isSyncing,
  isDisconnecting,
  onConnect,
  onSync,
  onDisconnect,
}: BlogIntegrationCardProps) {
  // 첫 렌더링 시 레이아웃 흔들림을 방지하기 위해 스켈레톤 카드를 보여줍니다.
  if (isLoading && !blogIntegration) {
    return (
      <article
        aria-busy="true"
        aria-label="블로그 피드 연동 정보 로딩 중"
        className="p-7 bg-spotify-dark-surface rounded-2xl border border-white/5 flex flex-col items-stretch gap-6 animate-pulse"
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
          <div className="flex items-start gap-6">
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-white/5 border border-white/5" />

            <div className="space-y-3 flex-1">
              <header className="flex items-center gap-3">
                <div className="h-6 w-24 bg-white/10 rounded-md" />
                <div className="h-5 w-16 bg-white/5 rounded-full" />
              </header>
              <div className="space-y-2">
                <div className="h-4 w-64 sm:w-80 bg-white/5 rounded" />
                <div className="h-4 w-48 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // API 요청 처리 중에는 다른 상호작용 버튼을 차단합니다.
  const isInteractionPending = isSyncing || isDisconnecting;

  const theme = getProviderStyles(blogIntegration?.provider);

  return (
    <article className="p-7 bg-spotify-dark-surface rounded-2xl border border-white/5 flex flex-col items-stretch gap-6 hover:bg-spotify-mid-dark transition-colors group">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
        <div className="flex items-start gap-6">
          <div
            className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${theme.bg}`}
          >
            <Rss
              className={`w-7 h-7 ${theme.text}`}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>

          <div>
            <header className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-[18px] font-bold text-white tracking-tight">
                블로그 피드
                {blogIntegration && (
                  <span className="text-[14px] font-normal text-spotify-silver ml-1.5">
                    ({getProviderDisplayName(blogIntegration.provider)})
                  </span>
                )}
              </h3>
              {blogIntegration ? (
                <span
                  role="status"
                  aria-label={`${getProviderDisplayName(blogIntegration.provider)} 피드 동기화 활성화됨`}
                  className="flex items-center gap-2 text-[11px] font-bold text-spotify-green bg-spotify-green/10 px-3 py-1 rounded-full uppercase tracking-spotify"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${theme.pulse} ${theme.shadow}`}></span>
                  동기화 활성화됨
                </span>
              ) : (
                <span
                  role="status"
                  aria-label="블로그 피드 연동 안 됨"
                  className="text-[11px] font-bold text-spotify-silver bg-white/5 px-3 py-1 rounded-full uppercase tracking-spotify"
                >
                  연동 안 됨
                </span>
              )}
            </header>
            <p className="text-[14px] text-spotify-silver font-medium leading-relaxed max-w-md">
              Tistory, Velog, Medium 또는 커스텀 RSS 피드로부터 최신 글을 가져와
              포트폴리오에 노출합니다.
            </p>
          </div>
        </div>

        {blogIntegration && (
          <div
            role="group"
            aria-label="블로그 피드 관리"
            className="w-full sm:w-auto flex flex-col sm:flex-row gap-3"
          >
            <Button
              onClick={onSync}
              disabled={isInteractionPending}
              aria-busy={isSyncing}
              className="w-full sm:w-40 btn-pill-primary h-11 flex items-center justify-center gap-2"
            >
              {isSyncing ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
              )}
              {isSyncing ? "동기화 중..." : "지금 동기화"}
            </Button>
            <Button
              onClick={onDisconnect}
              disabled={isInteractionPending}
              aria-busy={isDisconnecting}
              variant="outline"
              className="w-full sm:w-40 btn-pill-secondary h-11 text-spotify-silver hover:text-spotify-negative hover:border-spotify-negative/30 hover:bg-spotify-negative/5 flex items-center justify-center gap-2"
            >
              {isDisconnecting && (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              )}
              {isDisconnecting ? "해제 중..." : "연동 해제"}
            </Button>
          </div>
        )}
      </div>

      {blogIntegration && (
        <BlogActiveDetails blogIntegration={blogIntegration} />
      )}

      {!blogIntegration && !isLoading && (
        <BlogFeedForm onConnect={onConnect} isPending={isSyncing} />
      )}
    </article>
  );
}
