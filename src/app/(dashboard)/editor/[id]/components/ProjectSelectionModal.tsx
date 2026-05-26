"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { Check, GitFork, Search, Star, X } from "lucide-react";
import React, { useState } from "react";
import { type RawProject } from "@/types/project";

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    selectedIds: string[],
    customDescriptions: Record<string, string>,
  ) => void;
  initialSelectedIds: string[];
  initialCustomDescriptions: Record<string, string>;
  rawProjects: RawProject[];
  isSaving: boolean;
}

export default function ProjectSelectionModal({
  isOpen,
  onClose,
  onSave,
  initialSelectedIds,
  initialCustomDescriptions,
  rawProjects,
  isSaving,
}: ProjectSelectionModalProps) {
  // 모달 내부에서만 동작하는 로컬 상태들 ( Keystroke 렉 차단의 핵심 )
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(
    () => initialSelectedIds,
  );
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >(() => initialCustomDescriptions);

  if (!isOpen) return null;

  const filteredProjects = rawProjects.filter(
    (project: RawProject) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTempProject = (id: string) => {
    setTempSelectedIds((prevIds: string[]) =>
      prevIds.includes(id)
        ? prevIds.filter((item: string) => item !== id)
        : [...prevIds, id],
    );
  };

  const handleSave = () => {
    onSave(tempSelectedIds, tempCustomDescriptions);
  };

  return (
    <div className="fixed inset-0 z-50 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      {/* 모달 헤더 영역 */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 className="text-[18px] font-bold text-white">
            대표 리포지토리 선택 ({tempSelectedIds.length})
          </h3>
        </div>
        <Button
          className="btn-pill-primary h-11 px-8 font-bold cursor-pointer"
          onClick={handleSave}
          disabled={isSaving}
        >
          적용하기
        </Button>
      </div>

      {/* 모달 콘텐츠 본문 영역 */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full">
        {/* 검색 폼 */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-silver" />
            <Input
              placeholder="리포지토리 검색..."
              className="pl-12 h-14 bg-spotify-dark-surface border border-white/5 rounded-full text-[16px] focus:border-spotify-green text-white placeholder:text-spotify-silver/30 transition-all"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchQuery(e.target.value)
              }
            />
          </div>
        </div>

        {/* 리포지토리 목록 격자 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map((project: RawProject) => (
            <Card
              key={project.id}
              onClick={() => toggleTempProject(project.id)}
              className={`
                relative p-6 cursor-pointer rounded-[28px] border transition-all duration-300 group
                ${
                  tempSelectedIds.includes(project.id)
                    ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green/30 text-white shadow-spotify"
                    : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark text-white shadow-spotify"
                }
              `}
            >
              {/* 선택 여부 체크박스 표시 */}
              <div className="absolute top-5 right-5 h-6 w-6 rounded-full border border-white/5 bg-spotify-near-black flex items-center justify-center transition-colors">
                {tempSelectedIds.includes(project.id) && (
                  <div className="h-full w-full rounded-full bg-spotify-green flex items-center justify-center animate-in zoom-in-50 duration-200">
                    <Check className="w-4 h-4 text-black" strokeWidth={3} />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="pr-10">
                  <h4 className="font-extrabold text-[17px] text-white group-hover:text-spotify-green transition-colors line-clamp-1">
                    {project.name}
                  </h4>
                  <p className="text-[14px] text-spotify-silver line-clamp-2 mt-2 leading-relaxed min-h-[40px]">
                    {project.description || "설명이 없는 프로젝트입니다."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {project.language && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-bold text-spotify-silver uppercase tracking-wider border border-white/5">
                      {project.language}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-[12px] text-spotify-silver font-bold">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5" />
                      {project.stargazers_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5" />
                      {project.forks_count}
                    </div>
                  </div>
                </div>

                {/* 프로젝트 상세 소개글 마크다운 에디터 영역 ( 선택 시에만 표시 ) */}
                {tempSelectedIds.includes(project.id) && (
                  <div
                    className="pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) =>
                      e.stopPropagation()
                    }
                  >
                    <Label className="text-[11px] font-bold text-spotify-green uppercase tracking-wider flex items-center gap-2">
                      포트폴리오용 프로젝트 소개
                      <span className="px-1.5 py-0.5 rounded-md bg-spotify-green/10 text-spotify-green text-[10px]">
                        Markdown
                      </span>
                    </Label>

                    <MarkdownEditor
                      value={
                        tempCustomDescriptions[project.id] ??
                        project.description ??
                        ""
                      }
                      onChange={(val: string) => {
                        setTempCustomDescriptions(
                          (prevDescriptions: Record<string, string>) => ({
                            ...prevDescriptions,
                            [project.id]: val,
                          }),
                        );
                      }}
                    />

                    <p className="text-[11px] text-spotify-silver font-medium leading-relaxed">
                      README 요약 대신 이 내용이 우선적으로 노출됩니다. 직접
                      작성하거나 기존 마크다운 파일을 불러올 수 있습니다.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-spotify-silver font-bold text-lg">
                검색 결과가 없습니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
