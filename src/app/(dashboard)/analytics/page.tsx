"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { blockDisplayName } from "@/lib/block-labels";
import { getPortfolioState } from "@/lib/portfolio-state";
import { portfolioUrl } from "@/lib/portfolio-url";
import { useQuery } from "@tanstack/react-query";
import { Clock, Copy, ExternalLink, Layout } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { getUserPortfolios, type PortfolioWithBlocks } from "./actions";

interface DailyStat {
  date: string;
  views: number;
}

interface TopBlock {
  block_id: string;
  type: string;
  count: number;
}

interface TopReferrer {
  referrer: string;
  count: number;
}

interface AnalyticsSummary {
  totalViews: number;
  uniqueVisitors: number;
  totalClicks: number;
  dailyStats: DailyStat[];
  topBlocks: TopBlock[];
  topReferrers: TopReferrer[];
}

function getVisitorTrendSummary(stats: DailyStat[]) {
  if (!stats.length) return "선택한 기간의 일별 방문자 데이터가 없어요.";

  const firstViews = stats[0].views;
  const lastViews = stats.at(-1)?.views ?? firstViews;
  if (firstViews === lastViews)
    return `일별 페이지 뷰는 ${firstViews}건으로 기간의 처음과 마지막이 같아요.`;

  return `일별 페이지 뷰는 기간 첫날 ${firstViews}건에서 마지막 날 ${lastViews}건으로 ${lastViews > firstViews ? "증가" : "감소"}했어요.`;
}

export default function AnalyticsPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  // 1. Fetch Portfolios (Including blocks for ID translation)
  const { data: portfolios, isLoading: isPortfoliosLoading } = useQuery<
    PortfolioWithBlocks[]
  >({
    queryKey: ["portfolios", "analytics"],
    queryFn: () => getUserPortfolios(),
  });

  // Set default selection
  useEffect(() => {
    if (portfolios && portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolioId]);

  // 2. Fetch Summary
  const {
    data: summary,
    error: summaryError,
    isLoading: isSummaryLoading,
    isFetching: isSummaryFetching,
    refetch: refetchSummary,
  } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics", selectedPortfolioId, period],
    queryFn: async () => {
      const res = await fetch(
        `/api/analytics/${selectedPortfolioId}/summary?period=${period}`,
      );
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!selectedPortfolioId,
  });

  // Block ID Translation helper
  const getBlockName = (blockId: string) => {
    const activePortfolio = portfolios?.find(
      (p) => p.id === selectedPortfolioId,
    );
    if (!activePortfolio) return "알 수 없는 섹션";

    const block = activePortfolio.blocks.find((b) => b.id === blockId);
    if (!block) return "삭제된 섹션";

    return blockDisplayName[block.block_type] || block.block_type;
  };

  const selectedPortfolio = portfolios?.find(
    (portfolio) => portfolio.id === selectedPortfolioId,
  );
  const portfolioState = selectedPortfolio
    ? getPortfolioState(
        selectedPortfolio.is_published,
        selectedPortfolio.blocks.length,
      )
    : "draft";
  const hasAnalyticsData = Boolean(
    summary &&
    (summary.totalViews || summary.uniqueVisitors || summary.totalClicks),
  );
  const periodLabel =
    period === "7d" ? "7일" : period === "30d" ? "30일" : "90일";

  const copyPortfolioLink = async () => {
    if (!selectedPortfolio?.slug) return;

    try {
      await navigator.clipboard.writeText(portfolioUrl(selectedPortfolio.slug));
      toast.success("지원서용 링크를 복사했어요.");
    } catch {
      toast.error("링크를 복사하지 못했어요. 다시 시도해 주세요.");
    }
  };

  if (isPortfoliosLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in duration-500"
      >
        <span className="sr-only">분석 대시보드를 불러오는 중</span>
        {/* 헤더 + 컨트롤 */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-white/10" />
            <Skeleton className="h-9 w-56 max-w-full bg-white/10" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-12 w-[220px] rounded-2xl bg-white/5" />
            <Skeleton className="h-12 w-40 rounded-xl bg-white/5" />
          </div>
        </div>
        {/* 통계 카드 + 차트 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-2xl bg-white/5" />
      </div>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
        <div className="p-8 bg-spotify-dark-surface border border-white/5 rounded-3xl max-w-md shadow-spotify flex flex-col items-center space-y-6 animate-in fade-in duration-500">
          <div className="p-5 bg-spotify-mid-dark rounded-3xl border border-white/5">
            <Layout className="w-12 h-12 text-spotify-green" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              아직 분석할 포트폴리오가 없어요
            </h2>
            <p className="text-spotify-silver text-[14px] font-medium leading-relaxed">
              포트폴리오를 먼저 만들고 공개 준비를 마쳐보세요. 공개 후 방문자가
              생기면 이곳에서 통계를 확인할 수 있어요.
            </p>
          </div>
          <Button asChild className="btn-pill-primary h-12 px-8">
            <Link href="/dashboard#new-portfolio">포트폴리오 만들기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white p-6 sm:p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
          분석 대시보드
        </h1>

        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedPortfolioId}
            onValueChange={setSelectedPortfolioId}
          >
            <SelectTrigger className="w-[220px] h-12 rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark focus:ring-1 focus:ring-spotify-green focus:border-spotify-green">
              <SelectValue placeholder="포트폴리오 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/5 bg-spotify-dark-surface text-white shadow-spotify">
              {portfolios.map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  className="rounded-xl py-3 cursor-pointer text-white focus:bg-white/5 focus:text-white"
                >
                  <div className="flex flex-col">
                    <span className="font-bold">{p.title || p.slug}</span>
                    <span className="text-[11px] text-spotify-silver font-medium">
                      /{p.slug}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-spotify-dark-surface p-1.5 rounded-full flex gap-1 border border-white/5">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                aria-pressed={period === p}
                aria-label={`최근 ${p.slice(0, -1)}일 분석 보기`}
                className={`
                  px-4 py-2 rounded-full text-[13px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green
                  ${
                    period === p
                      ? "bg-white text-black shadow-spotify-md"
                      : "text-spotify-silver hover:text-white hover:bg-white/5"
                  }
                `}
              >
                {p.slice(0, -1)}일
              </button>
            ))}
          </div>
          {isSummaryFetching && (
            <span
              role="status"
              aria-live="polite"
              className="text-[12px] font-bold text-spotify-green"
            >
              선택한 분석을 업데이트하는 중…
            </span>
          )}
        </div>
      </div>

      {isSummaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-32 rounded-2xl bg-white/5" />
          <Skeleton className="h-[400px] md:col-span-3 rounded-2xl bg-white/5" />
        </div>
      ) : summary ? (
        hasAnalyticsData ? (
          <div className="space-y-10" aria-busy={isSummaryFetching}>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Card className="rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md">
                <CardContent className="p-8 space-y-2">
                  <p className="text-[13px] font-bold text-spotify-silver">
                    전체 조회
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    {summary.totalViews.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md">
                <CardContent className="p-8 space-y-2">
                  <p className="text-[13px] font-bold text-spotify-silver">
                    순 방문자
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    {summary.uniqueVisitors.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>

              <Card className="rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md">
                <CardContent className="p-8 space-y-2">
                  <p className="text-[13px] font-bold text-spotify-silver">
                    링크 클릭
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    {summary.totalClicks.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
            </div>

            {/* Main Chart */}
            <Card className="rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden">
              <CardHeader className="p-8 pb-0">
                <div>
                  <CardTitle
                    id="visitor-trend-title"
                    className="text-2xl font-bold text-white"
                  >
                    방문자 추이
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-spotify-silver mt-1">
                    지난 {periodLabel}간의 일별 페이지 뷰 현황이에요.
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div
                  aria-labelledby="visitor-trend-title"
                  aria-describedby="visitor-trend-summary"
                >
                  <p id="visitor-trend-summary" className="sr-only">
                    지난 {periodLabel}의 방문자 추이예요.{" "}
                    {getVisitorTrendSummary(summary.dailyStats)}
                  </p>
                  <div className="h-[350px] w-full" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={summary.dailyStats}
                        margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient
                            id="colorViews"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#ffffff"
                              stopOpacity={0.12}
                            />
                            <stop
                              offset="95%"
                              stopColor="#ffffff"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="rgba(255,255,255,0.05)"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#b3b3b3",
                          }}
                          dy={10}
                          tickFormatter={(val: string) =>
                            val.split("-").slice(1).join("/")
                          }
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 11,
                            fontWeight: 700,
                            fill: "#b3b3b3",
                          }}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#181818",
                            borderRadius: "20px",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                            padding: "12px 16px",
                          }}
                          labelStyle={{
                            marginBottom: "4px",
                            fontWeight: 800,
                            color: "#ffffff",
                          }}
                          itemStyle={{ fontWeight: 700, color: "#ffffff" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="views"
                          stroke="#ffffff"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorViews)"
                          animationDuration={600}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  {summary.dailyStats.length > 0 ? (
                    <table className="sr-only">
                      <caption>
                        지난 {periodLabel} 방문자 추이 일별 데이터
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">날짜</th>
                          <th scope="col">페이지 뷰</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.dailyStats.map((stat) => (
                          <tr key={stat.date}>
                            <td>{stat.date}</td>
                            <td>{stat.views}건</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="sr-only">
                      지난 {periodLabel}의 방문자 추이 데이터가 없어요.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {(summary.topBlocks[0] || summary.topReferrers[0]) && (
              <section
                className="flex flex-col gap-4 rounded-2xl border border-spotify-green/20 bg-spotify-green/5 p-6 sm:flex-row sm:items-center sm:justify-between"
                aria-label="다음 추천 작업"
              >
                <div>
                  <p className="text-[12px] font-bold text-spotify-green">
                    다음 한 가지
                  </p>
                  <p className="mt-1 text-[15px] font-bold text-white">
                    {summary.topBlocks[0]
                      ? `${getBlockName(summary.topBlocks[0].block_id)} 섹션이 가장 많은 관심을 받았어요.`
                      : `${summary.topReferrers[0].referrer || "직접 방문"}에서 방문이 가장 많아요.`}
                  </p>
                  <p className="mt-1 text-[13px] text-spotify-silver">
                    이 흐름을 이어서 포트폴리오를 다듬거나 링크를 공유해 보세요.
                  </p>
                </div>
                <Button asChild className="btn-pill-primary h-10 shrink-0 px-5">
                  <Link
                    href={`/editor/${selectedPortfolioId}?focus=${summary.topBlocks[0] ? "blocks" : "publish"}`}
                  >
                    {summary.topBlocks[0] ? "섹션 다듬기" : "공개 준비 확인"}
                  </Link>
                </Button>
              </section>
            )}

            {/* Detailed Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Blocks */}
              <Card className="rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-bold text-white">
                    인기 섹션 (클릭 수)
                  </CardTitle>
                  <CardDescription className="text-[13px] font-medium text-spotify-silver">
                    방문자가 가장 많이 눌러본 섹션이에요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-4">
                    {summary.topBlocks.length > 0 ? (
                      summary.topBlocks.map(
                        (
                          block: {
                            block_id: string;
                            type: string;
                            count: number;
                          },
                          idx: number,
                        ) => (
                          <div
                            key={block.block_id}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-4">
                              <div
                                className={`
                            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px]
                            ${idx === 0 ? "bg-spotify-green/10 text-spotify-green" : "bg-white/5 text-spotify-silver"}
                          `}
                              >
                                {idx + 1}
                              </div>
                              <div>
                                <h4 className="text-[15px] font-bold text-white transition-colors">
                                  {getBlockName(block.block_id)}
                                </h4>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[16px] font-bold text-white">
                                {block.count}
                              </span>
                              <span className="text-[11px] font-bold text-spotify-silver">
                                클릭
                              </span>
                            </div>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <div className="flex justify-center">
                          <Clock className="w-8 h-8 text-white/55" />
                        </div>
                        <p className="text-[13px] font-bold text-spotify-silver">
                          아직 클릭 데이터가 없어요.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Referrers */}
              <Card className="rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden">
                <CardHeader className="p-8">
                  <CardTitle className="text-xl font-bold text-white">
                    주요 유입 경로
                  </CardTitle>
                  <CardDescription className="text-[13px] font-medium text-spotify-silver">
                    방문자가 어떤 경로로 들어왔는지 확인해요.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="space-y-2">
                    {summary.topReferrers.length > 0 ? (
                      summary.topReferrers.map(
                        (ref: { referrer: string; count: number }) => (
                          <div
                            key={ref.referrer}
                            className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-spotify-near-black p-2 rounded-lg shadow-sm">
                                <ExternalLink className="w-3.5 h-3.5 text-spotify-silver group-hover:text-white" />
                              </div>
                              <span className="text-[14px] font-bold text-white truncate max-w-[200px] md:max-w-[300px]">
                                {ref.referrer === ""
                                  ? "직접 방문"
                                  : ref.referrer}
                              </span>
                            </div>
                            <Badge className="bg-white/5 border border-white/5 text-white font-bold px-3 py-1 text-[11px] shadow-sm">
                              {summary.totalViews
                                ? (
                                    (ref.count / summary.totalViews) *
                                    100
                                  ).toFixed(0)
                                : 0}
                              %
                            </Badge>
                          </div>
                        ),
                      )
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <div className="flex justify-center">
                          <Clock className="w-8 h-8 text-white/55" />
                        </div>
                        <p className="text-[13px] font-bold text-spotify-silver">
                          아직 유입 경로 데이터가 없어요.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <section
            className="max-w-xl py-12 sm:py-20"
            aria-labelledby="analytics-empty-title"
          >
            <p className="mb-3 text-[14px] font-bold text-spotify-green">
              첫 방문자를 기다리는 중
            </p>
            <h2
              id="analytics-empty-title"
              className="text-[clamp(28px,4vw,40px)] font-bold tracking-tight text-white"
            >
              아직 방문 데이터가 없어요
            </h2>
            <p className="mt-4 max-w-lg text-[16px] font-medium leading-relaxed text-spotify-silver">
              {portfolioState === "published"
                ? "공개 링크를 공유하면 방문과 반응이 이곳에 쌓여요."
                : portfolioState === "preview"
                  ? "공개 전 확인을 마치면 지원서에 넣을 링크를 만들 수 있어요."
                  : "먼저 에디터에서 포트폴리오를 구성해 주세요."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {portfolioState === "published" ? (
                <Button
                  onClick={copyPortfolioLink}
                  className="btn-pill-primary h-12 px-6"
                >
                  <Copy className="mr-2 h-4 w-4" /> 지원서용 링크 복사
                </Button>
              ) : portfolioState === "preview" ? (
                <Button asChild className="btn-pill-primary h-12 px-6">
                  <Link href={`/editor/${selectedPortfolioId}`}>
                    공개 전 확인하기
                  </Link>
                </Button>
              ) : (
                <Button asChild className="btn-pill-primary h-12 px-6">
                  <Link href={`/editor/${selectedPortfolioId}`}>
                    포트폴리오 구성하기
                  </Link>
                </Button>
              )}
            </div>
            <ul className="mt-8 space-y-3 border-t border-white/5 pt-6 text-[14px] font-medium leading-relaxed text-spotify-silver">
              <li>
                {portfolioState === "published"
                  ? "이력서나 지원서에 공개 링크를 넣어 첫 방문을 만들어 보세요."
                  : "에디터에서 공개 준비를 마치면 지원서에 넣을 링크를 만들 수 있어요."}
              </li>
              <li>
                방문이 쌓이면 조회 수, 유입 경로, 관심을 받은 섹션을 여기서
                확인할 수 있어요.
              </li>
            </ul>
          </section>
        )
      ) : (
        <div
          role="alert"
          className="py-20 text-center text-spotify-silver space-y-4"
        >
          <p>
            {summaryError instanceof Error
              ? "분석 데이터를 불러오지 못했어요."
              : "데이터를 불러오지 못했어요."}
          </p>
          <Button
            variant="outline"
            className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/5"
            onClick={() => refetchSummary()}
          >
            다시 시도
          </Button>
        </div>
      )}
    </div>
  );
}
