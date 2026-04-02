"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell
} from "recharts";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MousePointer2, 
  ExternalLink,
  ChevronDown,
  Layout,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPortfolios } from "./actions";

export default function AnalyticsPage() {
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>("");
  const [period, setPeriod] = useState<"7d" | "30d" | "90d">("7d");

  // 1. Fetch Portfolios
  const { data: portfolios, isLoading: isPortfoliosLoading } = useQuery({
    queryKey: ["portfolios", "analytics"],
    queryFn: () => getUserPortfolios(),
  });

  // Set default selection
  useMemo(() => {
    if (portfolios && portfolios.length > 0 && !selectedPortfolioId) {
      setSelectedPortfolioId(portfolios[0].id);
    }
  }, [portfolios, selectedPortfolioId]);

  // 2. Fetch Summary
  const { data: summary, isLoading: isSummaryLoading, isFetching: isSummaryFetching } = useQuery({
    queryKey: ["analytics", selectedPortfolioId, period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/${selectedPortfolioId}/summary?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
    enabled: !!selectedPortfolioId,
  });

  if (isPortfoliosLoading) {
    return (
      <div className="p-8 space-y-8 animate-in fade-in duration-500">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[400px] w-full rounded-[32px]" />
      </div>
    );
  }

  if (!portfolios || portfolios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center space-y-6">
        <div className="p-6 bg-blue-50 rounded-full">
            <Layout className="w-12 h-12 text-[#3182F6]" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-[#191F28]">아직 분석할 포트폴리오가 없습니다</h2>
            <p className="text-[#4E5968] max-w-sm">포트폴리오를 먼저 생성하고 홍보해 보세요. 방문자가 생기는 즉시 통계를 확인할 수 있습니다.</p>
        </div>
        <Button className="rounded-full bg-[#3182F6] hover:bg-[#2162D6] px-8 h-12 font-bold shadow-lg">포트폴리오 생성하기</Button>
      </div>
    );
  }

  const activePortfolio = portfolios.find(p => p.id === selectedPortfolioId);

  return (
    <div className="p-6 sm:p-10 space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-black/5">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#3182F6] font-bold text-sm tracking-widest uppercase">
            <TrendingUp className="w-4 h-4" />
            Performance Insight
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#191F28] tracking-tight">분석 대시보드</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPortfolioId} onValueChange={setSelectedPortfolioId}>
            <SelectTrigger className="w-[200px] h-12 rounded-2xl bg-white border-black/5 shadow-sm font-bold text-[#191F28]">
              <SelectValue placeholder="포트폴리오 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-black/5 shadow-xl">
              {portfolios.map(p => (
                <SelectItem key={p.id} value={p.id} className="rounded-xl py-3 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold">{p.title || p.slug}</span>
                    <span className="text-[11px] text-gray-400 font-medium">/{p.slug}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="bg-gray-100 p-1.5 rounded-2xl flex gap-1 border border-black/5">
            {(["7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  px-4 py-2 rounded-xl text-[13px] font-bold transition-all
                  ${period === p 
                    ? "bg-white text-[#3182F6] shadow-sm ring-1 ring-black/5 scale-[1.02]" 
                    : "text-gray-500 hover:text-gray-700 hover:bg-white/50"}
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
            <Skeleton className="h-32 rounded-[32px]" />
            <Skeleton className="h-32 rounded-[32px]" />
            <Skeleton className="h-32 rounded-[32px]" />
            <Skeleton className="h-[400px] md:col-span-3 rounded-[40px]" />
        </div>
      ) : summary ? (
        <div className="space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Card className="rounded-[32px] border-black/5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Total Views</p>
                    <h3 className="text-4xl font-extrabold text-[#191F28]">{summary.totalViews.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <Users className="w-6 h-6 text-[#3182F6]" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-black/5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Unique Visitors</p>
                    <h3 className="text-4xl font-extrabold text-[#191F28]">{summary.uniqueVisitors.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <MousePointer2 className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-black/5 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Total Clicks</p>
                    <h3 className="text-4xl font-extrabold text-[#191F28]">{summary.totalClicks.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-2xl group-hover:scale-110 transition-transform duration-500">
                    <BarChart3 className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Chart */}
          <Card className="rounded-[40px] border-black/5 shadow-sm overflow-hidden">
            <CardHeader className="p-8 pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-extrabold text-[#191F28]">방문자 추이</CardTitle>
                  <CardDescription className="text-sm font-medium mt-1">지난 {period === '7d' ? '7일' : period === '30d' ? '30일' : '90일'}간의 일별 페이지 뷰 현황입니다.</CardDescription>
                </div>
                {isSummaryFetching && <div className="text-[11px] font-bold text-blue-500 animate-pulse bg-blue-50 px-3 py-1 rounded-full uppercase">Refreshing...</div>}
              </div>
            </CardHeader>
            <CardContent className="p-8">
              <div className="h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={summary.dailyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3182F6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3182F6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#8B95A1' }}
                      dy={10}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fontWeight: 700, fill: '#8B95A1' }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        borderRadius: '20px', 
                        border: 'none', 
                        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                        padding: '12px 16px'
                      }}
                      labelStyle={{ marginBottom: '4px', fontWeight: 800, color: '#191F28' }}
                      itemStyle={{ fontWeight: 700, color: '#3182F6' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#3182F6" 
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
            <Card className="rounded-[40px] border-black/5 shadow-sm overflow-hidden">
               <CardHeader className="p-8">
                 <CardTitle className="text-xl font-extrabold text-[#191F28]">인기 블록 (클릭 수)</CardTitle>
                 <CardDescription className="text-[13px] font-medium">사용자들이 가장 많이 관심을 보인 섹션입니다.</CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-0">
                  <div className="space-y-4">
                    {summary.topBlocks.length > 0 ? (
                      summary.topBlocks.map((block: any, idx: number) => (
                        <div key={block.block_id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-4">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center font-bold text-[14px]
                                ${idx === 0 ? 'bg-blue-50 text-[#3182F6]' : 'bg-gray-50 text-gray-400'}
                            `}>
                                {idx + 1}
                            </div>
                            <div>
                                <h4 className="text-[15px] font-bold text-[#191F28] group-hover:text-[#3182F6] transition-colors">
                                    {block.type === 'block' ? `프로젝트/섹션 ${idx + 1}` : block.type}
                                </h4>
                                <p className="text-[11px] font-bold text-gray-400 tracking-wider">ID: {block.block_id.slice(0, 8)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                             <span className="text-[16px] font-extrabold text-[#191F28]">{block.count}</span>
                             <span className="text-[11px] font-bold text-gray-400 uppercase">Clicks</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <div className="flex justify-center"><Clock className="w-8 h-8 text-gray-200" /></div>
                        <p className="text-[13px] font-bold text-gray-400">아직 클릭 데이터가 없습니다.</p>
                      </div>
                    )}
                  </div>
               </CardContent>
            </Card>

            {/* Top Referrers */}
            <Card className="rounded-[40px] border-black/5 shadow-sm overflow-hidden">
               <CardHeader className="p-8">
                 <CardTitle className="text-xl font-extrabold text-[#191F28]">주요 유입 경로 (Referrers)</CardTitle>
                 <CardDescription className="text-[13px] font-medium">사용자들이 어떤 경로를 통해 접속했는지 확인하세요.</CardDescription>
               </CardHeader>
               <CardContent className="p-8 pt-0">
                  <div className="space-y-2">
                    {summary.topReferrers.length > 0 ? (
                      summary.topReferrers.map((ref: any, idx: number) => (
                        <div key={ref.referrer} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 hover:bg-blue-50 transition-colors group">
                          <div className="flex items-center gap-3">
                            <div className="bg-white p-2 rounded-lg shadow-sm">
                                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#3182F6]" />
                            </div>
                            <span className="text-[14px] font-bold text-[#4E5968] truncate max-w-[200px] md:max-w-[300px]">
                                {ref.referrer === '' ? 'Direct / Bookmark' : ref.referrer}
                            </span>
                          </div>
                          <Badge className="bg-white border-black/5 text-[#191F28] font-bold px-3 py-1 text-[11px] shadow-sm">
                            {(ref.count / summary.totalViews * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center space-y-3">
                        <div className="flex justify-center"><Clock className="w-8 h-8 text-gray-200" /></div>
                        <p className="text-[13px] font-bold text-gray-400">아직 유입 경로 데이터가 없습니다.</p>
                      </div>
                    )}
                  </div>
               </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="py-20 text-center text-gray-500">데이터를 불러오지 못했습니다.</div>
      )}
    </div>
  );
}
