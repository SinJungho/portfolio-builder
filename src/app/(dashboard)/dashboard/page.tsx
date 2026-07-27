"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getPortfolioReadiness } from "@/lib/portfolio-readiness";
import {
  getPortfolioState,
  portfolioStateLabel,
} from "@/lib/portfolio-state";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  AlertTriangle,
  Clock,
  Edit2,
  ExternalLink,
  Github,
  Loader2,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [syncJobId, setSyncJobId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await fetch("/api/portfolios");
      if (!res.ok) throw new Error("Failed to fetch dashboard data");
      return { ...(await res.json()), fetchedAt: Date.now() };
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error("생성에 실패했습니다.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/generate/${data.portfolio_id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/portfolios/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제에 실패했습니다.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("포트폴리오가 삭제되었습니다.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/integrations/github/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ force: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "동기화를 시작하지 못했습니다.");
      return data as { job_id: string };
    },
    onSuccess: ({ job_id }) => { setSyncJobId(job_id); toast.success("GitHub 동기화를 시작했습니다."); },
    onError: (error: Error) => toast.error(error.message),
  });

  const { data: syncJob, isError: isSyncJobError } = useQuery<{ status: string; error?: string }>({
    queryKey: ["github-sync", syncJobId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/github/sync/${syncJobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "동기화 상태를 확인하지 못했습니다.");
      return data;
    },
    enabled: Boolean(syncJobId),
    refetchInterval: (query) => ["completed", "failed"].includes(query.state.data?.status || "") ? false : 2500,
  });

  useEffect(() => {
    if (!syncJob || !syncJobId) return;
    if (syncJob.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("GitHub 동기화가 완료되었습니다.");
    } else if (syncJob.status === "failed") {
      toast.error(syncJob.error || "GitHub 동기화에 실패했습니다.");
    }
  }, [queryClient, syncJob, syncJobId]);

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex flex-col items-center justify-center min-h-[50vh] gap-4 w-full text-center"
      >
        <Loader2
          aria-hidden="true"
          className="animate-spin w-10 h-10 text-spotify-green"
        />
        <span className="text-spotify-silver text-sm font-bold animate-pulse tracking-spotify uppercase">
          포트폴리오 목록을 불러오는 중...
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <Alert variant="destructive" className="flex items-center justify-between gap-4 bg-spotify-negative/10 border-spotify-negative/20 text-spotify-negative rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden="true" className="h-4 w-4" />
            <AlertDescription className="font-bold">포트폴리오를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</AlertDescription>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="shrink-0 border-spotify-negative/30 bg-transparent text-spotify-negative hover:bg-spotify-negative/10 hover:text-spotify-negative">
            다시 시도
          </Button>
        </Alert>
      </div>
    );
  }

  const { portfolios, github_synced_at } = data;
  const isSyncStale = github_synced_at
    ? data.fetchedAt - new Date(github_synced_at).getTime() > 24 * 60 * 60 * 1000
    : false;

  return (
    <div className="max-w-7xl mx-auto py-10 md:py-16 px-6 flex flex-col gap-12 animate-in fade-in duration-700">
      <div className="flex flex-col gap-3">
        <h2 className="text-[32px] font-bold tracking-tight text-white">
          환영합니다! 👋
        </h2>
        <p className="text-spotify-silver text-[16px] font-semibold">
          지원서에 바로 넣을 수 있는 포트폴리오를 준비하세요.
        </p>
      </div>

      {/* GitHub 동기화 상태 바 영역 */}
      <section
        aria-label="GitHub 연동 상태 알림"
        className="flex flex-wrap items-center gap-3"
      >
        {!github_synced_at ? (
          <div
            role="region"
            aria-label="GitHub 연동 상태 경고"
            className="w-full p-6 bg-spotify-warning/10 border border-spotify-warning/20 rounded-2xl text-spotify-warning flex flex-col sm:flex-row items-center justify-between gap-4 shadow-spotify-md"
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2.5 bg-spotify-warning/20 rounded-full"
                aria-hidden="true"
              >
                <AlertTriangle className="w-6 h-6 shrink-0" />
              </div>
              <span className="font-bold text-[16px]">
                GitHub 연동이 완료되지 않았습니다.
              </span>
            </div>
            <Link href="/settings?section=integrations">
              <Button className="btn-pill-primary h-12 px-8">
                GitHub 연동 확인하기
              </Button>
            </Link>
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className={`flex flex-wrap items-center gap-3 text-[13px] font-bold px-5 py-2.5 rounded-full border shadow-spotify-md ${
              isSyncStale
                ? "border-spotify-warning/30 bg-spotify-warning/10 text-spotify-warning"
                : "border-white/5 bg-spotify-mid-dark text-spotify-silver"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isSyncStale ? "bg-spotify-warning" : "bg-spotify-green animate-pulse shadow-[0_0_8px_rgba(30,215,96,0.5)]"
              }`}
              aria-hidden="true"
            />
            <Github className="w-4 h-4" aria-hidden="true" />
            <span>
              {isSyncStale ? "동기화 확인 필요:" : "마지막 동기화:"}{" "}
              {formatDistanceToNow(new Date(github_synced_at), {
                addSuffix: true,
                locale: ko,
              })}
            </span>
            {isSyncStale && <Button type="button" variant="ghost" size="sm" disabled={syncMutation.isPending || (Boolean(syncJobId) && !isSyncJobError && !["completed", "failed"].includes(syncJob?.status || ""))} onClick={() => { if (isSyncJobError) setSyncJobId(null); syncMutation.mutate(); }} className="h-7 rounded-full px-2 text-[12px] font-bold text-spotify-warning hover:bg-spotify-warning/10 hover:text-white"><RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending || (syncJobId && !isSyncJobError && !["completed", "failed"].includes(syncJob?.status || "")) ? "animate-spin" : ""}`} />{isSyncJobError ? "상태 확인 실패 · 다시 시도" : syncMutation.isPending || (syncJobId && !["completed", "failed"].includes(syncJob?.status || "")) ? "동기화 중" : "지금 동기화"}</Button>}
          </div>
        )}
      </section>

      {/* 포트폴리오 목록 섹션 */}
      <section aria-labelledby="portfolio-section-title" className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2
            id="portfolio-section-title"
            className="text-[24px] font-bold tracking-tight text-white"
          >
            내 포트폴리오
          </h2>
        </div>

        {portfolios.length === 0 ? (
          <div id="new-portfolio" className="flex flex-col items-center justify-center p-16 md:p-24 bg-spotify-dark-surface rounded-2xl gap-8 text-center shadow-spotify">
            <div
              className="p-8 bg-spotify-mid-dark rounded-full text-spotify-green shadow-spotify-md"
              aria-hidden="true"
            >
              <Plus className="w-12 h-12" />
            </div>
            <div className="space-y-3">
              <h3 className="text-[24px] font-bold text-white">
                아직 포트폴리오가 없어요
              </h3>
              <p className="text-spotify-silver text-[16px] font-medium max-w-sm leading-relaxed">
                GitHub 연동 한 번으로 AI가 당신만의 전문적인 포트폴리오를 구성해
                드립니다. 1분이면 충분해요!
              </p>
            </div>
            <Button
              size="lg"
              className="btn-pill-primary h-14 px-12 text-[17px]"
              disabled={createMutation.isPending}
              onClick={() => createMutation.mutate()}
              aria-label="첫 포트폴리오 생성하기"
            >
              {createMutation.isPending ? "만드는 중..." : "지금 시작하기"}
            </Button>
          </div>
        ) : (
          <ul
            aria-label="내 포트폴리오 카드 목록"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 p-0 m-0"
          >
            {/* 새 포트폴리오 만들기 카드 */}
            <li className="list-none">
              <button
                type="button"
                id="new-portfolio"
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
                className="group w-full relative flex flex-col items-center justify-center border border-white/10 rounded-xl p-8 min-h-[300px] bg-spotify-dark-surface hover:bg-spotify-mid-dark hover:border-white/20 transition-all duration-300 shadow-spotify-md"
                aria-label="새 포트폴리오 만들기"
                aria-busy={createMutation.isPending}
              >
                <div
                  className="p-5 bg-spotify-near-black text-white rounded-full mb-6 transition-all group-hover:scale-110 group-hover:bg-spotify-green group-hover:text-black duration-500 shadow-spotify-md"
                  aria-hidden="true"
                >
                  <Plus className="w-10 h-10" />
                </div>
                <span className="text-[18px] font-bold text-white tracking-tight">
                  {createMutation.isPending ? "만드는 중..." : "새 포트폴리오 만들기"}
                </span>
              </button>
            </li>

            {/* 기존 포트폴리오 카드 리스트 */}
            {portfolios.map(
              (p: {
                id: string;
                title: string | null;
                slug: string | null;
                theme: string;
                is_published: boolean;
                created_at: string | Date;
                _count: { blocks: number };
                blocks: { block_type: string; is_visible: boolean; config: Record<string, unknown> }[];
              }) => {
                const state = getPortfolioState(
                  p.is_published,
                  p._count.blocks,
                );
                const readiness = getPortfolioReadiness(p.blocks);
                const completeCount = readiness.filter((item) => item.complete).length;
                const nextItem = readiness.find((item) => !item.complete);
                const stateLabel = state === "preview" && nextItem ? "작성 중" : portfolioStateLabel[state];

                return (
                  <li
                  key={p.id}
                  className="group relative flex flex-col bg-spotify-dark-surface rounded-2xl overflow-hidden shadow-spotify-md hover:bg-spotify-mid-dark transition-colors duration-300 min-h-[300px] list-none"
                >
                  <div className="p-7 flex-1 flex flex-col items-start gap-5">
                    <div className="flex w-full items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[22px] text-white truncate mb-2 group-hover:text-spotify-green transition-colors">
                          {p.title || p.slug}
                        </h3>
                        <div className="flex items-center gap-2.5">
                          <span className="text-[12px] font-bold text-spotify-silver">
                            {stateLabel}
                          </span>
                          <div
                            className="h-1 w-1 rounded-full bg-white/20"
                            aria-hidden="true"
                          />
                          <span className="text-[12px] font-medium text-spotify-silver truncate tracking-tight">
                            <span className="sr-only">공개 후 주소: </span>
                            {p.slug}.portfolioforge.app
                          </span>
                        </div>
                      </div>
                      {state === "published" ? (
                        <div
                          role="status"
                          aria-label="배포 상태: 공개됨"
                          className="shrink-0 px-3 py-1 text-[11px] font-bold bg-spotify-green text-black rounded-full flex items-center gap-1.5"
                        >
                          <div
                            className="h-1.5 w-1.5 rounded-full bg-black animate-pulse"
                            aria-hidden="true"
                          />
                          공개됨
                        </div>
                      ) : (
                        <div
                          role="status"
                          aria-label={`배포 상태: ${stateLabel}`}
                          className="shrink-0 px-3 py-1 text-[11px] font-bold bg-white/10 text-spotify-silver rounded-full"
                        >
                          {stateLabel}
                        </div>
                      )}
                    </div>

                    <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4">
                      <div className="flex items-center gap-2 text-[12px] font-bold text-spotify-silver">
                        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                        <span className="sr-only">생성 일자: </span>
                        <span>
                          {formatDistanceToNow(new Date(p.created_at), {
                            addSuffix: true,
                            locale: ko,
                          })}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium text-spotify-silver">
                        구성한 섹션 {p._count.blocks}개
                      </span>
                    </div>
                    {state !== "published" && <div className="w-full space-y-2"><div className="flex items-center justify-between text-[12px] font-bold"><span className="text-white">공개 준비 {completeCount}/{readiness.length}</span><span className="text-spotify-silver">{nextItem ? `다음: ${nextItem.action}` : "다음: 미리보기 확인"}</span></div><div role="progressbar" aria-label={`${p.title || p.slug} 공개 준비도`} aria-valuemin={0} aria-valuemax={readiness.length} aria-valuenow={completeCount} className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-spotify-green" style={{ width: `${(completeCount / readiness.length) * 100}%` }} /></div></div>}
                  </div>

                  <div className="p-4 pt-0">
                    <nav
                      aria-label={`${p.title || p.slug} 포트폴리오 제어 도구`}
                      className="flex h-14 bg-spotify-near-black rounded-full border border-white/5 overflow-hidden p-1 shadow-spotify-md"
                    >
                      {state === "published" && (
                        <a
                          href={p.slug ? `/${p.slug}` : "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 text-[13px] font-bold text-spotify-silver hover:text-white transition-all rounded-full"
                          aria-label={`${p.title || p.slug} 포트폴리오 새 창에서 보기`}
                        >
                          <ExternalLink className="w-4 h-4 opacity-70" aria-hidden="true" />
                          보기
                        </a>
                      )}
                      <Link
                        href={`/editor/${p.id}${nextItem ? `?focus=${nextItem.id}` : ""}`}
                        prefetch={false}
                        className="flex-1 flex items-center justify-center gap-2 text-[13px] font-bold text-black bg-white hover:bg-spotify-near-white transition-all rounded-full shadow-spotify-md"
                        aria-label={`${p.title || p.slug} ${state === "published" ? "다듬기" : nextItem ? nextItem.action : "공개 전 확인"}`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                        {state === "published" ? "다듬기" : nextItem ? nextItem.action : "공개 전 확인"}
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            className="w-12 flex items-center justify-center text-spotify-silver hover:text-spotify-negative transition-all rounded-full"
                            aria-label={`${p.title || p.slug} 포트폴리오 삭제`}
                          >
                            <Trash2
                              className="w-4.5 h-4.5"
                              aria-hidden="true"
                            />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-spotify-dark-surface border-none rounded-[24px] shadow-spotify">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[22px] font-bold text-white">
                              포트폴리오를 삭제할까요?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-spotify-silver text-[15px] font-medium leading-relaxed">
                              이 작업은 되돌릴 수 없습니다. 포트폴리오와 관련된
                              모든 데이터가 영구적으로 삭제됩니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-4">
                            <AlertDialogCancel className="bg-transparent border border-white/10 text-white rounded-full h-12 font-bold px-8 hover:bg-white/5 transition-colors">
                              취소
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(p.id)}
                              variant="destructive"
                              className="!bg-[#e91429] hover:!bg-[#c31022] active:scale-95 transition-all text-white rounded-full h-12 font-bold px-8 shadow-spotify-md border-none cursor-pointer"
                            >
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </nav>
                  </div>
                </li>
                );
              },
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
