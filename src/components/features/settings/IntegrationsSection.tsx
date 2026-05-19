"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Github,
  Link2,
  Loader2,
  RefreshCw,
  Rss,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

interface Integration {
  id: string;
  user_id: string;
  provider: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  synced_at: string | null;
  is_active: boolean;
  created_at: string;
}

export function IntegrationsSection() {
  const queryClient = useQueryClient();
  const [rssUrl, setRssUrl] = useState("");

  // 1. 연동 정보 조회
  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ["integrations", "rss"],
    queryFn: async () => {
      const res = await fetch("/api/integrations/rss");
      if (!res.ok) throw new Error("연동 서비스 정보를 가져오지 못했습니다.");
      return res.json();
    },
  });

  // 활성화된 블로그 피드 연동 찾기
  const blogIntegration = integrations?.find((i: Integration) =>
    ["tistory", "velog", "medium", "custom_rss"].includes(i.provider),
  );

  // 2. 블로그 피드 연결 (동기화) Mutation
  const connectMutation = useMutation({
    mutationFn: async (url: string) => {
      const res = await fetch("/api/integrations/rss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "RSS 피드 연동에 실패했습니다.");
      return data;
    },
    onSuccess: (data: { syncedCount: number }) => {
      toast.success(
        `RSS 피드가 연결되었습니다! ${data.syncedCount}개의 글이 동기화되었습니다.`,
      );
      setRssUrl("");
      queryClient.invalidateQueries({ queryKey: ["integrations", "rss"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // 3. 블로그 피드 연동 해제 Mutation
  const disconnectMutation = useMutation({
    mutationFn: async (integrationId: string) => {
      const res = await fetch("/api/integrations/rss", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId }),
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "RSS 피드 연동 해제에 실패했습니다.");
      return data;
    },
    onSuccess: () => {
      toast.success("블로그 피드 연동이 해제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["integrations", "rss"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rssUrl.trim()) return;
    connectMutation.mutate(rssUrl.trim());
  };

  const handleSync = () => {
    if (!blogIntegration?.metadata?.feedUrl) return;
    connectMutation.mutate(blogIntegration.metadata.feedUrl);
  };

  const handleDisconnect = () => {
    if (!blogIntegration) return;
    disconnectMutation.mutate(blogIntegration.id);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-black text-white mb-8 tracking-tight uppercase tracking-spotify">
          연동된 서비스
        </h2>

        <div className="grid grid-cols-1 gap-6">
          {/* GitHub Integration */}
          <div className="p-8 bg-spotify-dark-surface rounded-[32px] border border-white/5 flex flex-col sm:flex-row items-start justify-between gap-6 hover:bg-spotify-mid-dark transition-all group">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 shrink-0 bg-spotify-green/10 rounded-2xl flex items-center justify-center border border-spotify-green/20 group-hover:border-spotify-green/30 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(30,215,96,0.05)]">
                <Github className="w-7 h-7 text-spotify-green" strokeWidth={1.5} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-[18px] font-black text-white tracking-tight">
                    GitHub
                  </h3>
                  <span className="flex items-center gap-2 text-[11px] font-black text-spotify-green bg-spotify-green/10 px-3 py-1 rounded-full uppercase tracking-spotify">
                    <span className="w-1.5 h-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]"></span>
                    연동됨
                  </span>
                </div>
                <p className="text-[14px] text-spotify-silver font-medium leading-relaxed max-w-md">
                  레포지토리와 잔디(기여도) 데이터를 연동하여 포트폴리오를
                  자동으로 구축합니다.
                </p>
              </div>
            </div>

            <div className="w-full sm:w-auto">
              <Button
                variant="outline"
                disabled
                className="w-full sm:w-40 btn-pill-secondary h-11 text-spotify-silver/40 border-white/5 bg-transparent cursor-not-allowed"
              >
                로그인 필수 연동
              </Button>
            </div>
          </div>

          {/* Blog Feed Integration */}
          <div className="p-8 bg-spotify-dark-surface rounded-[32px] border border-white/5 flex flex-col items-stretch gap-6 hover:bg-spotify-mid-dark transition-all group">
            <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div className="flex items-start gap-6">
                <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 ${
                  blogIntegration
                    ? "bg-spotify-green/10 border-spotify-green/20 shadow-[0_0_15px_rgba(30,215,96,0.05)]"
                    : "bg-white/5 border-white/5"
                }`}>
                  <Rss
                    className={
                      blogIntegration
                        ? "w-7 h-7 text-spotify-green"
                        : "w-7 h-7 text-spotify-silver"
                    }
                    strokeWidth={1.5}
                  />
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className="text-[18px] font-black text-white tracking-tight">
                      블로그 피드
                    </h3>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-spotify-green" />
                    ) : blogIntegration ? (
                      <span className="flex items-center gap-2 text-[11px] font-black text-spotify-green bg-spotify-green/10 px-3 py-1 rounded-full uppercase tracking-spotify">
                        <span className="w-1.5 h-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]"></span>
                        동기화 활성화됨
                      </span>
                    ) : (
                      <span className="text-[11px] font-black text-spotify-silver bg-white/5 px-3 py-1 rounded-full uppercase tracking-spotify">
                        연동 안 됨
                      </span>
                    )}
                  </div>
                  <p className="text-[14px] text-spotify-silver font-medium leading-relaxed max-w-md">
                    Tistory, Velog, Medium 또는 커스텀 RSS 피드로부터 최신 글을
                    가져와 포트폴리오에 노출합니다.
                  </p>
                </div>
              </div>

              {blogIntegration && (
                <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSync}
                    disabled={connectMutation.isPending}
                    className="w-full sm:w-40 btn-pill-primary h-11 flex items-center justify-center gap-2"
                  >
                    {connectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    지금 동기화
                  </Button>
                  <Button
                    onClick={handleDisconnect}
                    disabled={disconnectMutation.isPending}
                    variant="outline"
                    className="w-full sm:w-40 btn-pill-secondary h-11 text-spotify-silver hover:text-spotify-negative hover:border-spotify-negative/30 hover:bg-spotify-negative/5 flex items-center justify-center gap-2"
                  >
                    {disconnectMutation.isPending && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    연동 해제
                  </Button>
                </div>
              )}
            </div>

            {/* Active Integration details */}
            {blogIntegration && (
              <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-2 text-[13px] text-spotify-silver animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-spotify-green" />
                  <span className="font-bold text-white">피드 주소:</span>
                  <span className="truncate max-w-md font-mono">
                    {blogIntegration.metadata?.feedUrl}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-spotify-green" />
                  <span className="font-bold text-white">서비스:</span>
                  <span className="uppercase font-extrabold text-[11px] bg-white/10 px-2 py-0.5 rounded text-white">
                    {blogIntegration.provider}
                  </span>
                  <span className="mx-2 text-white/20">|</span>
                  <span className="font-bold text-white">최근 동기화:</span>
                  <span>
                    {blogIntegration.synced_at
                      ? new Date(blogIntegration.synced_at).toLocaleString(
                          "ko-KR",
                        )
                      : "없음"}
                  </span>
                </div>
              </div>
            )}

            {/* Connection Form for inactive integration */}
            {!blogIntegration && !isLoading && (
              <form
                onSubmit={handleConnect}
                className="mt-2 p-4 bg-white/5 border border-white/5 rounded-[24px] space-y-4 animate-in slide-in-from-top-2 duration-300"
              >
                <div className="space-y-4">
                  <label
                    htmlFor="rss-feed"
                    className="text-sm block pb-4 mb-0 font-bold text-white"
                  >
                    RSS 피드 URL 연결
                  </label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      id="rss-feed"
                      placeholder="https://velog.io/@username/rss"
                      className="flex-1 h-11 bg-spotify-near-black border-white/5 focus:border-spotify-green text-white rounded-xl placeholder:text-spotify-silver/30"
                      value={rssUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRssUrl(e.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={connectMutation.isPending || !rssUrl.trim()}
                      className="w-full sm:w-40 btn-pill-primary h-11 flex items-center justify-center gap-2"
                    >
                      {connectMutation.isPending && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                      피드 연결
                    </Button>
                  </div>
                </div>
                <p className="text-[12px] text-spotify-silver/60 leading-relaxed font-medium">
                  💡 <strong>내 블로그 피드 주소 찾는 방법:</strong>
                  <br />- <strong>Velog:</strong>{" "}
                  <code>https://velog.io/@username/rss</code>
                  <br />- <strong>Tistory:</strong>{" "}
                  <code>https://username.tistory.com/rss</code>
                  <br />- <strong>Medium:</strong>{" "}
                  <code>https://medium.com/feed/@username</code>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
