"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  ExternalLink,
  Layout,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function AnalyticsPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  // 1. Fetch Portfolios (Including blocks for ID translation)
  const { data: portfolios, isLoading: isPortfoliosLoading } = useQuery<PortfolioWithBlocks[]>({
    queryKey: ["portfolios", "analytics"],
    queryFn: () => getUserPortfolios(),
  });

  // Set default selection
  useEffect(() => {
    if (portfolios && portfolios.length > 0 && !selectedPortfolioId) {
      setTimeout(() => setSelectedPortfolioId(portfolios[0].id), 0);
    }
  }, [portfolios, selectedPortfolioId]);

  // 2. Fetch Summary
  const { data: summary, isLoading: isSummaryLoading, isFetching: isSummaryFetching } = useQuery<AnalyticsSummary>({
    queryKey: ["analytics", selectedPortfolioId, period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/${selectedPortfolioId}/summary?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!selectedPortfolioId,
  });

  // Block ID Translation helper
  const getBlockName = (blockId: string) => {
    const activePortfolio = portfolios?.find(p => p.id === selectedPortfolioId);
    if (!activePortfolio) return `섹션 (ID: ${blockId.slice(0, 4)})`;
    
    const block = activePortfolio.blocks.find(b => b.id === blockId);
    if (!block) return `섹션 (ID: ${blockId.slice(0, 4)})`;
    
    const blockTypeNames: Record<string, string> = {
      hero: "Hero 소개 섹션",
      project_grid: "프로젝트 그리드",
      skills: "기술 스택 차트",
      blog_feed: "블로그 RSS 피드",
      contact: "연락처 및 소셜 링크"
    };
    return blockTypeNames[block.block_type] || block.block_type;
  };

  if (isPortfoliosLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen bg-[#121212]">
        <Skeleton className="h-10 w-48 bg-white/10" />
        <Skeleton className="h-[400px] w-full rounded-[32px] bg-white/10" />
      </div>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-[#121212]">
        <div className="p-8 bg-spotify-dark-surface border border-white/5 rounded-[40px] max-w-md shadow-spotify flex flex-col items-center space-y-6 animate-in fade-in duration-500">
          <div className="p-5 bg-spotify-green/10 rounded-3xl border border-spotify-green/20">
            <Layout className="w-12 h-12 text-spotify-green" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">아직 분석할 포트폴리오가 없습니다</h2>
            <p className="text-spotify-silver text-[14px] font-medium leading-relaxed">
              포트폴리오를 먼저 생성하고 전 세계에 공유해 보세요. 방문자가 생기는 즉시 통계를 실시간으로 확인하실 수 있습니다.
            </p>
          </div>
          <Button className="rounded-full bg-spotify-green hover:bg-spotify-green/90 text-black font-extrabold px-8 h-12 transition-all scale-100 hover:scale-105 active:scale-95">
            포트폴리오 생성하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white p-6 sm:p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-white/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-spotify-green font-bold text-xs tracking-widest uppercase">
            <TrendingUp className="w-4 h-4" />
            Performance Insight
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">분석 대시보드</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
            <SelectTrigger className="w-[220px] h-12 rounded-2xl bg-spotify-dark-surface border-white/5 shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark focus:ring-1 focus:ring-spotify-green focus:border-spotify-green">
              <SelectValue placeholder="포트폴리오 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-white/5 bg-spotify-dark-surface text-white shadow-spotify">
              {portfolios.map((p) => (
                <SelectItem key={p.id} value={p.id} className="rounded-xl py-3 cursor-pointer text-white focus:bg-white/5 focus:text-white">
                  <div className="flex flex-col">
                    <span className="font-bold">{p.title || p.slug}</span>
                    <span className="text-[11px] text-spotify-silver font-medium">/{p.slug}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-spotify-dark-surface p-1.5 rounded-2xl flex gap-1 border border-white/5">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  px-4 py-2 rounded-xl text-[13px] font-extrabold transition-all
                  ${period === p 
                    ? "bg-white text-black shadow-spotify-md scale-[1.02]" 
                    : "text-spotify-silver hover:text-white hover:bg-white/5"}
                `}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isSummaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-[32px] bg-white/5" />
          <Skeleton className="h-32 rounded-[32px] bg-white/5" />
          <Skeleton className="h-32 rounded-[32px] bg-white/5" />
          <Skeleton className="h-[400px] md:col-span-3 rounded-[40px] bg-white/5" />
        </div>
      ) : summary ? (
        <div className="space-y-10">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="rounded-[32px] bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden group hover:bg-spotify-mid-dark transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-spotify-silver uppercase tracking-wider">Total Views</p>
                    <h3 className="text-4xl font-black text-white">{summary.totalViews.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-spotify-green/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-6 h-6 text-spotify-green" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden group hover:bg-spotify-mid-dark transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-spotify-silver uppercase tracking-wider">Unique Visitors</p>
                    <h3 className="text-4xl font-black text-white">{summary.uniqueVisitors.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <MousePointer2 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden group hover:bg-spotify-mid-dark transition-all duration-300">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-spotify-silver uppercase tracking-wider">Total Clicks</p>
                    <h3 className="text-4xl font-black text-white">{summary.totalClicks.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="rounded-[40px] bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-black text-white">방문자 추이</CardTitle>
                  <CardDescription className="text-sm font-medium text-spotify-silver mt-1">
                    지난 {period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'}간의 일별 페이지 뷰 현황입니다.
                  </CardDescription>
                </div>
                {isSummaryFetching && (
                  <div className="text-[11px] font-bold text-spotify-green animate-pulse bg-spotify-green/10 px-3 py-1 rounded-full uppercase">
                    Refreshing...
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1ed760" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#1ed760" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#b3b3b3' }}
                      dy={10}
                      tickFormatter={(val: string) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#b3b3b3' }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#181818',
                        borderRadius: '20px', 
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ marginBottom: '4px', fontWeight: 800, color: '#ffffff' }}
                      itemStyle={{ fontWeight: 700, color: '#1ed760' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#1ed760" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top Blocks */}
            <Card className="rounded-[40px] bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black text-white">인기 블록 (클릭 수)</CardTitle>
                <CardDescription className="text-[13px] font-medium text-spotify-silver">
                  사용자들이 가장 많이 관심을 보인 섹션입니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {summary.topBlocks.length > 0 ? (
                    summary.topBlocks.map((block: { block_id: string; type: string; count: number }, idx: number) => (
                      <div key={block.block_id} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px]
                            ${idx === 0 ? 'bg-spotify-green/10 text-spotify-green' : 'bg-white/5 text-spotify-silver'}
                          `}>
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-[15px] font-extrabold text-white group-hover:text-spotify-green transition-colors">
                              {getBlockName(block.block_id)}
                            </h4>
                            <p className="text-[11px] font-bold text-spotify-silver tracking-wider uppercase">
                              ID: {block.block_id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[16px] font-black text-white">{block.count}</span>
                          <span className="text-[11px] font-bold text-spotify-silver uppercase">Clicks</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="flex justify-center"><Clock className="w-8 h-8 text-white/20" /></div>
                      <p className="text-[13px] font-bold text-spotify-silver">아직 클릭 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card className="rounded-[40px] bg-spotify-dark-surface border-white/5 shadow-spotify-md overflow-hidden">
              <CardHeader className="p-8">
                <CardTitle className="text-xl font-black text-white">주요 유입 경로 (Referrers)</CardTitle>
                <CardDescription className="text-[13px] font-medium text-spotify-silver">
                  사용자들이 어떤 경로를 통해 접속했는지 확인하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-2">
                  {summary.topReferrers.length > 0 ? (
                    summary.topReferrers.map((ref: { referrer: string; count: number }) => (
                      <div key={ref.referrer} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group">
                        <div className="flex items-center gap-3">
                          <div className="bg-[#121212] p-2 rounded-lg shadow-sm">
                            <ExternalLink className="w-3.5 h-3.5 text-spotify-silver group-hover:text-spotify-green" />
                          </div>
                          <span className="text-[14px] font-bold text-white truncate max-w-[200px] md:max-w-[300px]">
                            {ref.referrer === '' ? 'Direct / Bookmark' : ref.referrer}
                          </span>
                        </div>
                        <Badge className="bg-white/5 border border-white/5 text-spotify-green font-extrabold px-3 py-1 text-[11px] shadow-sm">
                          {(ref.count / summary.totalViews * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 text-center space-y-3">
                      <div className="flex justify-center"><Clock className="w-8 h-8 text-white/20" /></div>
                      <p className="text-[13px] font-bold text-spotify-silver">아직 유입 경로 데이터가 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-spotify-silver">데이터를 불러오지 못했습니다.</div>
      )}
    </div>
  );
}
