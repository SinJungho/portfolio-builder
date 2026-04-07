"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Check, 
  ChevronRight, 
  Sparkles, 
  Info, 
  Star, 
  GitFork, 
  Clock, 
  Search,
  Filter,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

interface RawProject {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
  is_featured: boolean;
}

export default function ConfigureStep({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [aiFocus, setAiFocus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects, isLoading } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      if (!res.ok) throw new Error("Failed to fetch projects");
      const data = await res.json();
      // Initialize selectedIds with featured projects or top 4
      if (selectedIds.length === 0) {
        const featured = data.filter((p: any) => p.is_featured).map((p: any) => p.id);
        if (featured.length > 0) {
          setSelectedIds(featured);
        } else {
          setSelectedIds(data.slice(0, 4).map((p: any) => p.id));
        }
      }
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/portfolios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          portfolio_id: portfolioId, 
          project_ids: selectedIds,
          ai_focus: aiFocus,
          auto_publish: true 
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "생성에 실패했습니다.");
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/generate/${portfolioId}?step=generate&generate_job_id=${data.job_id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleProject = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter((i: any) => i !== id) : [...prev, id]
    );
  };

  const filteredProjects = projects?.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <h2 className="text-[28px] font-extrabold tracking-tight text-[#191F28] leading-[1.2]">
          더 완벽한 포트폴리오를 위해<br />세부 사항을 확인해주세요.
        </h2>
        <p className="text-[16px] text-[#4E5968] font-medium leading-[1.6]">
          AI가 선택한 기본 프로젝트를 변경하거나, 강조하고 싶은 역량을 입력할 수 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Project Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[19px] font-bold text-[#191F28]">프로젝트 선택 ({selectedIds.length})</h3>
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="검색..." 
                className="pl-9 h-10 bg-white border-black/5 rounded-xl text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-40 rounded-[24px] bg-gray-100 animate-pulse" />
              ))
            ) : (
              filteredProjects?.map((project) => (
                <Card 
                  key={project.id}
                  onClick={() => toggleProject(project.id)}
                  className={`
                    relative p-5 cursor-pointer rounded-[24px] border transition-all duration-300
                    ${selectedIds.includes(project.id) 
                      ? "border-[#3182F6] bg-blue-50/30 ring-1 ring-[#3182F6]" 
                      : "border-black/5 bg-white hover:border-gray-200 hover:shadow-md"}
                  `}
                >
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full border border-black/5 bg-gray-50 flex items-center justify-center transition-colors">
                    {selectedIds.includes(project.id) && (
                      <div className="h-full w-full rounded-full bg-[#3182F6] flex items-center justify-center animate-in zoom-in-50 duration-200">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="pr-8">
                      <h4 className="font-bold text-[16px] text-[#191F28] line-clamp-1">{project.name}</h4>
                      <p className="text-[13px] text-[#4E5968] line-clamp-2 mt-1 leading-relaxed h-10">
                        {project.description || "설명이 없는 프로젝트입니다."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {project.language && (
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          {project.language}
                        </span>
                      )}
                      <div className="flex items-center gap-3 text-[12px] text-gray-400 font-medium">
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {project.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {project.forks_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {project.pushed_at ? formatDistanceToNow(new Date(project.pushed_at), { addSuffix: true, locale: ko }) : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* AI Focus & CTA */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="space-y-4 rounded-[28px] border border-black/5 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[#3182F6] mb-1">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-[17px]">AI에게 강조하고 싶은 점</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ai-focus" className="text-[13px] font-bold text-[#4E5968]">전문 분야 혹은 목표</Label>
              <textarea 
                id="ai-focus"
                placeholder="예: 클라우드 네이티브 아키텍처 전문가, 7년차 풀스택 개발자의 기술적 깊이 강조"
                className="w-full min-h-[120px] p-4 rounded-2xl border border-black/5 bg-gray-50/50 text-[14px] leading-relaxed focus:bg-white focus:ring-2 focus:ring-[#3182F6]/20 transition-all outline-none"
                value={aiFocus}
                onChange={(e) => setAiFocus(e.target.value)}
              />
              <p className="text-[12px] text-gray-400 leading-relaxed flex items-start gap-1.5 px-1">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                입력하신 내용을 바탕으로 AI가 소개글(Hero Block)을 더 정교하게 다듬습니다.
              </p>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full h-[56px] rounded-2xl bg-[#3182F6] text-[16px] font-bold hover:brightness-110 shadow-[0_8px_20px_rgba(49,130,246,0.3)] transition-all active:scale-95 disabled:opacity-50"
                onClick={() => generateMutation.mutate()}
                disabled={generateMutation.isPending || selectedIds.length === 0}
              >
                {generateMutation.isPending ? "분석 중..." : "AI 포트폴리오 생성하기"}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 text-gray-400">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="text-[12px] leading-[1.6]">생성 후에도 언제든지 디자인과 내용을 수정할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
