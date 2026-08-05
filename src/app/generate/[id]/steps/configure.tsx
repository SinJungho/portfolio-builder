"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  GitFork,
  Info,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { type RawProject } from "@/types/project";
import { MAX_FEATURED_PROJECTS } from "@/lib/project-selection";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";

export default function ConfigureStep({
  portfolioId,
}: {
  portfolioId: string;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [aiFocus, setAiFocus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: projects, isLoading } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      const data = await res.json();
      if (!res.ok) throw new Error(responseErrorMessage(data, "PROJECT_LIST_FAILED"));
      
      // 대표 프로젝트가 없으면 featured 또는 첫 프로젝트를 사용한다.
      if (selectedIds.length === 0) {
        const featured = (data as RawProject[])
          .filter((p: RawProject) => p.is_featured)
          .map((p: RawProject) => p.id)
          .slice(0, MAX_FEATURED_PROJECTS);
        if (featured.length > 0) {
          setSelectedIds(featured);
        } else {
          setSelectedIds(
            (data as RawProject[])
              .slice(0, MAX_FEATURED_PROJECTS)
              .map((p: RawProject) => p.id),
          );
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
          auto_publish: false,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(responseErrorMessage(data, "PORTFOLIO_CREATE_FAILED"));
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(
        `/generate/${portfolioId}?step=generate&generate_job_id=${data.job_id}`,
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const toggleProject = (id: string) => {
    if (!selectedIds.includes(id) && selectedIds.length >= MAX_FEATURED_PROJECTS) {
      toast.info(errorMessage("PROJECT_LIMIT"));
      return;
    }
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const filteredProjects = projects?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
      <div className="space-y-3">
        <h2 className="text-[28px] font-extrabold tracking-tight text-white leading-[1.2]">
          더 완벽한 포트폴리오를 위해
          <br />
          세부 사항을 확인해주세요.
        </h2>
        <p className="text-[16px] text-spotify-silver font-medium leading-[1.6]">
          AI가 선택한 기본 프로젝트를 변경하거나, 강조하고 싶은 역량을 입력할 수
          있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[19px] font-bold text-white">
              프로젝트 선택 ({selectedIds.length}/{MAX_FEATURED_PROJECTS})
            </h3>
            <div className="relative w-48 md:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-spotify-silver" />
              <Input
                placeholder="검색..."
                className="pl-10 h-10 bg-spotify-mid-dark border-white/5 rounded-full text-white text-sm placeholder:text-spotify-silver focus:ring-1 focus:ring-spotify-green focus:border-spotify-green"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-40 rounded-2xl bg-spotify-dark-surface/50 border border-white/5 animate-pulse"
                  />
                ))
              : filteredProjects?.map((project) => (
                  <Card
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    className={`
                    relative p-5 cursor-pointer rounded-2xl border transition-all duration-300 select-none
                    ${
                      selectedIds.includes(project.id)
                        ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green"
                        : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark hover:shadow-spotify"
                    }
                  `}
                  >
                    <div className="absolute top-4 right-4 h-6 w-6 rounded-full border border-white/10 bg-spotify-mid-dark flex items-center justify-center transition-colors">
                      {selectedIds.includes(project.id) && (
                        <div className="h-full w-full rounded-full bg-spotify-green flex items-center justify-center animate-in zoom-in-50 duration-200">
                          <Check className="w-4 h-4 text-black stroke-[3px]" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="pr-8">
                        <h4 className="font-bold text-[16px] text-white line-clamp-1">
                          {project.name}
                        </h4>
                        <p className="text-[13px] text-spotify-silver line-clamp-2 mt-1 leading-relaxed h-10 font-normal">
                          {project.description || "설명이 없는 프로젝트입니다."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {project.language && (
                          <span className="px-2 py-1 rounded-md bg-spotify-mid-dark border border-white/5 text-[11px] font-bold text-spotify-silver uppercase tracking-wider">
                            {project.language}
                          </span>
                        )}
                        <div className="flex items-center gap-3 text-[12px] text-spotify-silver font-medium">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 text-spotify-silver" />
                            {project.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="w-3 h-3 text-spotify-silver" />
                            {project.forks_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-spotify-silver" />
                            {project.pushed_at
                              ? formatDistanceToNow(
                                  new Date(project.pushed_at),
                                  { addSuffix: true, locale: ko },
                                )
                              : "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="space-y-4 rounded-3xl border border-white/5 bg-spotify-dark-surface p-6 shadow-spotify">
            <div className="flex items-center gap-2 text-spotify-green mb-1">
              <Sparkles className="w-5 h-5 fill-current" />
              <h3 className="font-bold text-[17px]">AI에게 강조하고 싶은 점</h3>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="ai-focus"
                className="text-[13px] font-bold text-spotify-silver"
              >
                전문 분야 혹은 목표
              </Label>
              <textarea
                id="ai-focus"
                placeholder="예: 클라우드 네이티브 아키텍처 전문가, 7년차 풀스택 개발자의 기술적 깊이 강조"
                className="w-full min-h-[120px] p-4 rounded-2xl border border-white/5 bg-spotify-mid-dark text-white text-[14px] leading-relaxed focus:ring-1 focus:ring-spotify-green focus:border-spotify-green transition-all outline-none"
                value={aiFocus}
                onChange={(e) => setAiFocus(e.target.value)}
              />
              <p className="text-[12px] text-spotify-silver leading-relaxed flex items-start gap-1.5 px-1 font-normal">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                입력하신 내용을 바탕으로 AI가 소개글(Hero Block)을 더 정교하게
                다듬습니다.
              </p>
            </div>

            <div className="pt-2">
              <Button
                className="btn-pill-primary w-full h-[56px] text-[16px] font-bold shadow-[0_8px_20px_rgba(30,215,96,0.2)] cursor-pointer"
                onClick={() => generateMutation.mutate()}
                disabled={
                  generateMutation.isPending || selectedIds.length === 0
                }
              >
                {generateMutation.isPending
                  ? "분석 중..."
                  : "AI 포트폴리오 생성하기"}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 text-spotify-silver">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-spotify-green" />
            <p className="text-[12px] leading-[1.6] font-normal">
              생성 후에도 언제든지 디자인과 내용을 수정할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
