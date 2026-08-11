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
import { portfolioUrl, portfolioUrlLabel } from "@/lib/portfolio-url";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  AlertTriangle,
  Clock,
  Copy,
  Edit2,
  Github,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import DashboardLoading from "./loading";

type DashboardPortfolio = {
  id: string;
  title: string | null;
  slug: string | null;
  custom_domain: string | null;
  theme: string;
  is_published: boolean;
  created_at: string | Date;
  _count: { blocks: number };
  blocks: { block_type: string; is_visible: boolean; config: Record<string, unknown> }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [syncJobId, setSyncJobId] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: async () => {
      const res = await fetch("/api/portfolios");
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(responseErrorMessage(data, "FETCH_FAILED"));
      return { ...data, fetchedAt: Date.now() };
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
        const data = await res.json().catch(() => null);
        throw new Error(responseErrorMessage(data, "PORTFOLIO_CREATE_FAILED"));
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
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(responseErrorMessage(data, "PORTFOLIO_DELETE_FAILED"));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("포트폴리오를 삭제했어요.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/integrations/github/sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ force: true }) });
      const data = await res.json();
      if (!res.ok) throw new Error(responseErrorMessage(data, "SYNC_START_FAILED"));
      return data as { job_id: string };
    },
    onSuccess: ({ job_id }) => { setSyncError(null); setSyncJobId(job_id); toast.success("GitHub 동기화를 시작했어요."); },
    onError: (error: Error) => { setSyncError(error.message); toast.error(error.message); },
  });

  const { data: syncJob, isError: isSyncJobError } = useQuery<{ status: string; error?: string }>({
    queryKey: ["github-sync", syncJobId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/github/sync/${syncJobId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(responseErrorMessage(data, "SYNC_STATUS_FAILED"));
      return data;
    },
    enabled: Boolean(syncJobId),
    refetchInterval: (query) => ["completed", "failed"].includes(query.state.data?.status || "") ? false : 2500,
  });

  useEffect(() => {
    if (!syncJob || !syncJobId) return;
    if (syncJob.status === "completed") {
      queryClient.invalidateQueries({ queryKey: ["dashboardData"] });
      toast.success("GitHub 동기화를 마쳤어요.");
    } else if (syncJob.status === "failed") {
      toast.error(syncJob.error || errorMessage("SYNC_FAILED"));
    }
  }, [queryClient, syncJob, syncJobId]);

  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        <span className="sr-only">포트폴리오 목록을 불러오는 중</span>
        <DashboardLoading />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-6">
        <Alert variant="destructive" className="flex items-center justify-between gap-4 bg-spotify-negative/10 border-spotify-negative/20 text-spotify-negative rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle aria-hidden="true" className="h-4 w-4" />
            <AlertDescription className="font-bold">포트폴리오를 불러오지 못했어요. 다시 시도해 주세요.</AlertDescription>
          </div>
          <Button variant="outline" onClick={() => refetch()} className="shrink-0 border-spotify-negative/30 bg-transparent text-spotify-negative hover:bg-spotify-negative/10 hover:text-spotify-negative">
            다시 시도
          </Button>
        </Alert>
      </div>
    );
  }

  const { portfolios, github_connected, github_synced_at } = data;
  const availableProjectIds = (data.available_project_ids as string[] | undefined) ?? [];
  const describedProjectIds = (data.described_project_ids as string[] | undefined) ?? [];
  const syncFailure = syncJob?.status === "failed"
    ? syncJob.error || errorMessage("SYNC_FAILED")
    : syncError;
  const githubSyncDate = github_synced_at ? new Date(github_synced_at) : null;
  const hasGithubSync = Boolean(githubSyncDate && !Number.isNaN(githubSyncDate.getTime()));
  const hasDraft = portfolios.some((portfolio: { is_published: boolean }) => !portfolio.is_published);
  const hasReadyDraft = portfolios.some((portfolio: { is_published: boolean; blocks: { block_type: string; is_visible: boolean; config: Record<string, unknown> }[] }) =>
    !portfolio.is_published && getPortfolioReadiness(portfolio.blocks, availableProjectIds, describedProjectIds).every((item) => item.complete),
  );
  const hasPublishedPortfolio = portfolios.some((portfolio: { is_published: boolean }) => portfolio.is_published);
  const mostAdvancedDraft = (portfolios as DashboardPortfolio[])
    .filter((portfolio) => !portfolio.is_published)
    .map((portfolio) => ({
      portfolio,
      readiness: getPortfolioReadiness(portfolio.blocks, availableProjectIds, describedProjectIds),
    }))
    .sort((a, b) => b.readiness.filter((item) => item.complete).length - a.readiness.filter((item) => item.complete).length)[0];
  const nextDraftItem = mostAdvancedDraft?.readiness.find((item) => !item.complete);
  const journeyStep = !github_connected ? 1 : portfolios.length === 0 ? 2 : hasReadyDraft ? 3 : hasPublishedPortfolio ? 4 : 3;
  const journeyMessage = !github_connected
    ? "GitHub 연동을 확인하면 프로젝트를 포트폴리오 초안으로 만들 수 있어요."
    : portfolios.length === 0
      ? "GitHub 프로젝트를 불러와 초안을 만들면 약 1분 뒤에 이어서 다듬을 수 있어요."
      : hasReadyDraft
        ? "필수 정보를 모두 채웠어요. 공개 전 확인을 마치고 링크를 공유해 보세요."
        : hasPublishedPortfolio && !hasDraft
          ? "공개 링크가 준비됐어요. 지원서에 복사해 바로 공유할 수 있어요."
          : "가장 진행된 초안을 먼저 마무리하면 지원서용 링크를 만들 수 있어요.";
  const isSyncStale = !githubSyncDate || !hasGithubSync || data.fetchedAt - githubSyncDate.getTime() > 24 * 60 * 60 * 1000;

  return (
    <div className="max-w-7xl mx-auto py-8 sm:py-10 md:py-16 px-4 sm:px-6 flex flex-col gap-14 md:gap-16 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6">
        <div className="max-w-3xl space-y-4">
          <div className="space-y-2">
            <h1 className="text-[32px] font-bold tracking-tight text-white">
              {hasPublishedPortfolio && !hasDraft ? "공개 링크가 준비됐어요" : "이미 만든 것만으로 충분해요"}
            </h1>
            <p className="text-spotify-silver text-[16px] font-semibold">
              {journeyMessage}
            </p>
          </div>
          {/* 신규 사용자에게만 온보딩 여정을 표시한다. */}
          {portfolios.length === 0 && (
          <ol aria-label="포트폴리오 준비 단계" className="flex items-stretch gap-2">
            {[
              "GitHub 확인",
              "AI 초안 만들기",
              "공개 전 확인",
              "링크 공유",
            ].map((step, index) => {
              const stepNumber = index + 1;
              const isCurrent = journeyStep === stepNumber;
              const isComplete = journeyStep > stepNumber || (stepNumber === 4 && hasPublishedPortfolio && !hasDraft);

              return (
                <li key={step} className="flex-1 space-y-1.5" aria-current={isCurrent ? "step" : undefined}>
                  <div className={`h-1 rounded-full ${isComplete ? "bg-spotify-green" : isCurrent ? "bg-white" : "bg-white/10"}`} />
                  <span className={`block text-[11px] font-bold leading-tight ${isCurrent ? "text-white" : "text-spotify-silver"}`}>
                    <span className="mr-1 opacity-60">{stepNumber}</span>{step}
                  </span>
                </li>
              );
            })}
          </ol>
          )}
          {mostAdvancedDraft && (
            <div className="flex flex-col gap-3 rounded-lg bg-spotify-dark-surface p-4 shadow-spotify-md sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[12px] font-bold text-spotify-green">다음 한 가지</p>
                <p className="mt-1 text-[15px] font-bold text-white">{mostAdvancedDraft.portfolio.title || mostAdvancedDraft.portfolio.slug} {nextDraftItem ? `· ${nextDraftItem.label}` : "· 공개 전 확인"}</p>
              </div>
              <Link href={`/editor/${mostAdvancedDraft.portfolio.id}${nextDraftItem ? `?focus=${nextDraftItem.destination}` : ""}`} className="w-full sm:w-auto">
                <Button className="btn-pill-primary h-10 w-full px-5 text-[12px] sm:w-auto">
                  {nextDraftItem ? nextDraftItem.action : "공개 전 확인하기"}
                </Button>
              </Link>
            </div>
          )}
        </div>

        <section
          aria-label="GitHub 연동 상태 알림"
          className="flex flex-wrap items-center gap-3"
        >
        {!github_connected ? (
          <div
            role="region"
            aria-label="GitHub 연동 상태 경고"
            className="w-full p-4 sm:p-6 bg-spotify-warning/10 border border-spotify-warning/20 rounded-lg text-spotify-warning flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-spotify-md"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="p-2.5 bg-spotify-warning/20 rounded-full"
                aria-hidden="true"
              >
                <AlertTriangle className="w-6 h-6 shrink-0" />
              </div>
              <span className="min-w-0 font-bold text-[16px]">
                GitHub 연동을 확인하면 포트폴리오를 만들 수 있어요.
              </span>
            </div>
            <Link href="/settings?section=integrations" className="w-full sm:w-auto">
              <Button className="btn-pill-primary h-12 w-full px-6 sm:w-auto sm:px-8">
                GitHub 연동 확인하기
              </Button>
            </Link>
          </div>
        ) : syncFailure ? (
          <div
            role="alert"
            aria-live="assertive"
            className="w-full p-4 sm:p-5 bg-spotify-negative/10 border border-spotify-negative/30 rounded-lg text-spotify-negative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-spotify-md"
          >
            <div className="min-w-0">
              <p className="font-bold">GitHub 동기화에 실패했어요.</p>
              <p className="mt-1 text-sm text-spotify-silver break-words">원인: {syncFailure}</p>
            </div>
            <div className="flex w-full sm:w-auto flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={syncMutation.isPending} onClick={() => { setSyncJobId(null); syncMutation.mutate(); }} className="border-spotify-negative/30 bg-transparent text-spotify-negative hover:bg-spotify-negative/10 hover:text-spotify-negative">
                {syncMutation.isPending ? "재시도 중…" : "다시 시도"}
              </Button>
              <Link href="/settings?section=integrations">
                <Button type="button" variant="ghost" className="text-white hover:bg-white/10 hover:text-white">연동 설정</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            role="status"
            aria-live="polite"
            className={`flex flex-wrap items-center gap-2.5 text-[13px] font-bold rounded-full ${
              isSyncStale
                ? "border border-spotify-warning/30 bg-spotify-warning/10 text-spotify-warning px-5 py-2.5 shadow-spotify-md"
                : "text-spotify-silver px-1.5 py-1"
            }`}
          >
            <div
              className={`h-2 w-2 rounded-full ${
                isSyncStale ? "bg-spotify-warning" : "bg-spotify-green animate-pulse"
              }`}
              aria-hidden="true"
            />
            <Github className="w-4 h-4" aria-hidden="true" />
            <span>
              {hasGithubSync && githubSyncDate
                ? `${isSyncStale ? "동기화 필요 ·" : "마지막 동기화:"} ${formatDistanceToNow(githubSyncDate, {
                    addSuffix: true,
                    locale: ko,
                  })}`
                : "아직 GitHub 데이터를 불러오지 않았어요."}
            </span>
            {isSyncStale && <Button type="button" variant="ghost" size="sm" disabled={syncMutation.isPending || (Boolean(syncJobId) && !isSyncJobError && !["completed", "failed"].includes(syncJob?.status || ""))} onClick={() => { if (isSyncJobError) setSyncJobId(null); syncMutation.mutate(); }} className="h-7 rounded-full px-2 text-[12px] font-bold text-spotify-warning hover:bg-spotify-warning/10 hover:text-white"><RefreshCw className={`h-3.5 w-3.5 ${syncMutation.isPending || (syncJobId && !isSyncJobError && !["completed", "failed"].includes(syncJob?.status || "")) ? "animate-spin" : ""}`} />{isSyncJobError ? "동기화 다시 시도" : syncMutation.isPending || (syncJobId && !["completed", "failed"].includes(syncJob?.status || "")) ? "GitHub 동기화 중" : "지금 동기화"}</Button>}
          </div>
        )}
        </section>
      </div>

      <section id="new-portfolio" aria-labelledby="portfolio-section-title" className="space-y-8">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h2
            id="portfolio-section-title"
            className="text-[24px] font-bold tracking-tight text-white"
          >
            내 포트폴리오
          </h2>
        </div>

        {portfolios.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 md:p-24 bg-spotify-dark-surface rounded-lg gap-8 text-center shadow-spotify">
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
                {github_connected
                  ? "GitHub 프로젝트를 불러와 지원서에 쓸 포트폴리오 초안을 만들어요. 약 1분이면 돼요."
                  : "먼저 GitHub 연동을 확인해 주세요. 연동 후 프로젝트를 불러와 포트폴리오를 만들 수 있어요."}
              </p>
            </div>
            <Button
              size="lg"
              className="btn-pill-primary h-14 px-12 text-[17px]"
              disabled={!github_connected || createMutation.isPending}
              onClick={() => github_connected && createMutation.mutate()}
              aria-label={github_connected ? "GitHub에서 프로젝트 불러와 포트폴리오 만들기" : "GitHub 연동 후 포트폴리오 만들기 가능"}
            >
              {createMutation.isPending ? "프로젝트 불러오는 중…" : github_connected ? "GitHub에서 프로젝트 불러와 포트폴리오 만들기" : "GitHub 연동 후 만들 수 있어요"}
            </Button>
          </div>
        ) : (
          <ul
            aria-label="내 포트폴리오 카드 목록"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 p-0 m-0"
          >
            {[...portfolios].sort((a, b) => {
              const progress = (portfolio: typeof a) => getPortfolioReadiness(portfolio.blocks, availableProjectIds, describedProjectIds).filter((item) => item.complete).length;
              if (a.is_published !== b.is_published) return Number(a.is_published) - Number(b.is_published);
              return progress(b) - progress(a);
            }).map(
              (p: {
                id: string;
                title: string | null;
                slug: string | null;
                custom_domain: string | null;
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
                const readiness = getPortfolioReadiness(p.blocks, availableProjectIds, describedProjectIds);
                const completeCount = readiness.filter((item) => item.complete).length;
                const nextItem = readiness.find((item) => !item.complete);
                const stateLabel = state === "preview" && nextItem ? "작성 중" : portfolioStateLabel[state];
                const publicUrl = p.slug
                  ? portfolioUrl(p.slug, p.custom_domain)
                  : null;
                const publicLabel = p.slug
                  ? portfolioUrlLabel(p.slug, p.custom_domain)
                  : "주소 준비 중";
                const addressLabel = state === "published" ? "공개 주소" : "예정 주소";

                return (
                  <li
                  key={p.id}
                  className="group relative flex flex-col bg-spotify-dark-surface rounded-lg overflow-hidden shadow-spotify-md hover:bg-spotify-mid-dark transition-colors duration-300 min-h-[300px] list-none"
                >
                  <div className="p-7 flex-1 flex flex-col items-start gap-5">
                    <div className="flex w-full items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-[22px] text-white truncate mb-2 group-hover:text-white transition-colors">
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
                            <span className="font-bold">{addressLabel}: </span>
                            {publicLabel}
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
                    {state !== "published" && <div className="w-full space-y-2"><div className="flex items-center justify-between text-[12px] font-bold"><span className="text-white">공개 준비 {completeCount}/{readiness.length} 완료</span><span className="text-spotify-silver">{nextItem ? `다음: ${nextItem.action}` : "다음: 공개 전 확인하기"}</span></div><div role="progressbar" aria-label={`${p.title || p.slug} 공개 준비도`} aria-valuemin={0} aria-valuemax={readiness.length} aria-valuenow={completeCount} className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-spotify-green" style={{ width: `${(completeCount / readiness.length) * 100}%` }} /></div></div>}
                  </div>

                  <div className="p-4 pt-0">
                    <nav
                      aria-label={`${p.title || p.slug} 포트폴리오 제어 도구`}
                      className="flex h-14 bg-spotify-near-black rounded-full border border-white/5 overflow-hidden p-1 shadow-spotify-md"
                    >
                      {state === "published" && (
                        <button
                          type="button"
                          disabled={!publicUrl}
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(publicUrl || "");
                              toast.success("지원서용 링크를 복사했어요.");
                            } catch {
                              toast.error(errorMessage("LINK_COPY_FAILED"));
                            }
                          }}
                          className="flex-[1.4] flex items-center justify-center gap-2 text-[13px] font-bold text-black bg-spotify-green hover:brightness-110 transition-all rounded-full disabled:opacity-50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-black"
                          aria-label={`${p.title || p.slug} 지원서용 링크 복사`}
                        >
                          <Copy className="w-4 h-4" aria-hidden="true" />
                          지원서용 링크 복사
                        </button>
                      )}
                      <Link
                        href={`/editor/${p.id}${nextItem ? `?focus=${nextItem.destination}` : ""}`}
                        prefetch={false}
                        className={`flex-1 flex items-center justify-center gap-2 text-[13px] font-bold ${state === "published" ? "text-spotify-silver hover:text-white" : "text-black bg-white hover:bg-spotify-near-white shadow-spotify-md"} transition-all rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-spotify-green`}
                        aria-label={`${p.title || p.slug} ${state === "published" ? "다듬기" : nextItem ? nextItem.action : "공개 전 확인하기"}`}
                      >
                        <Edit2 className="w-4 h-4" aria-hidden="true" />
                        {state === "published" ? "다듬기" : nextItem ? nextItem.action : "공개 전 확인하기"}
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            type="button"
                            disabled={deleteMutation.isPending}
                            className="w-12 flex items-center justify-center text-spotify-silver hover:text-spotify-negative transition-all rounded-full focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-spotify-green"
                            aria-label={`${p.title || p.slug} 포트폴리오 삭제`}
                          >
                            <Trash2
                              className="w-4.5 h-4.5"
                              aria-hidden="true"
                            />
                          </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-spotify-dark-surface border-none rounded-lg shadow-spotify">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-[22px] font-bold text-white">
                              포트폴리오를 삭제할까요?
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-spotify-silver text-[15px] font-medium leading-relaxed">
                              되돌릴 수 없어요. 포트폴리오와 관련된
                              모든 데이터가 영구적으로 삭제돼요.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="pt-4">
                            <AlertDialogCancel className="bg-transparent border border-white/10 text-white rounded-full h-12 font-bold px-8 hover:bg-white/5 transition-colors">
                              취소
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteMutation.mutate(p.id)}
                              variant="destructive"
                              className="!bg-spotify-negative-strong hover:!bg-spotify-negative-strong-hover active:scale-95 transition-all text-white rounded-full h-12 font-bold px-8 shadow-spotify-md border-none cursor-pointer"
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
            <li className="list-none order-last md:order-first">
              <button
                type="button"
                disabled={!github_connected || createMutation.isPending}
                onClick={() => github_connected && createMutation.mutate()}
                className="group w-full relative flex min-h-32 items-center justify-center gap-4 rounded-xl border border-white/10 bg-spotify-dark-surface px-5 py-4 shadow-spotify-md transition-all duration-300 hover:border-white/20 hover:bg-spotify-mid-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green disabled:opacity-50 md:min-h-[300px] md:flex-col md:p-8"
                aria-label={github_connected ? "GitHub에서 프로젝트 불러와 포트폴리오 만들기" : "GitHub 연동 후 포트폴리오 만들기 가능"}
                aria-busy={createMutation.isPending}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-spotify-near-black text-white transition-all group-hover:bg-spotify-green group-hover:text-black md:mb-6 md:h-20 md:w-20" aria-hidden="true">
                  <Plus className="h-6 w-6 md:h-10 md:w-10" aria-hidden="true" />
                </span>
                <span className="text-left text-[16px] font-bold tracking-tight text-white md:text-center md:text-[18px]">
                  {createMutation.isPending ? "프로젝트 불러오는 중…" : github_connected ? "GitHub에서 프로젝트 불러와 포트폴리오 만들기" : "GitHub 연동 후 만들 수 있어요"}
                </span>
              </button>
            </li>
          </ul>
        )}
      </section>
    </div>
  );
}
