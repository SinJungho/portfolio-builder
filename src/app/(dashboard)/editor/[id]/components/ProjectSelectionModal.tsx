"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { useCloseGuard, DiscardChangesDialog } from "./useCloseGuard";
import { Check, GitFork, Search, Star, X } from "lucide-react";
import React, { useRef, useState } from "react";
import { MAX_FEATURED_PROJECTS } from "@/lib/project-selection";
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
  const initialFeaturedIds = initialSelectedIds.slice(0, MAX_FEATURED_PROJECTS);
  // 모달 내부에서만 동작하는 로컬 상태들 ( Keystroke 렉 차단의 핵심 )
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>(
    () => initialFeaturedIds,
  );
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >(() => initialCustomDescriptions);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isDirty =
    JSON.stringify(tempSelectedIds) !== JSON.stringify(initialFeaturedIds) ||
    JSON.stringify(tempCustomDescriptions) !== JSON.stringify(initialCustomDescriptions);
  const { requestClose, confirmOpen, setConfirmOpen } = useCloseGuard(isDirty, onClose);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    requestClose,
    searchInputRef,
  );

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
        : prevIds.length < MAX_FEATURED_PROJECTS
          ? [...prevIds, id]
          : prevIds,
    );
  };

  const handleSave = () => {
    onSave(tempSelectedIds, tempCustomDescriptions);
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="project-selection-title" aria-describedby="project-selection-description" onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      {/* 모달 헤더 영역 */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={requestClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
            type="button"
            aria-label="프로젝트 선택 닫기"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 id="project-selection-title" className="text-[18px] font-bold text-white">
            대표 프로젝트 선택 ({tempSelectedIds.length}/{MAX_FEATURED_PROJECTS})
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
          <p id="project-selection-description" className="text-sm font-medium text-spotify-silver">채용 담당자에게 보여줄 대표 프로젝트를 최대 3개 선택하세요. 선택한 순서대로 공개돼요.</p>
          <div className="relative">
            <Label htmlFor="project-search" className="sr-only">프로젝트 검색</Label>
            <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-silver" />
            <Input
              id="project-search"
              placeholder="프로젝트 검색..."
              className="pl-12 h-14 bg-spotify-dark-surface border border-white/5 rounded-full text-[16px] focus:border-spotify-green text-white placeholder:text-spotify-silver/80 transition-all"
              value={searchQuery}
              ref={searchInputRef}
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
              className={`
                relative p-6 rounded-3xl border transition-all duration-300 group
                ${
                  tempSelectedIds.includes(project.id)
                    ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green/30 text-white shadow-spotify"
                    : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark text-white shadow-spotify"
                }
              `}
            >
              {/* 선택 여부 체크박스 표시 */}
              <button type="button" onClick={() => toggleTempProject(project.id)} disabled={!tempSelectedIds.includes(project.id) && tempSelectedIds.length >= MAX_FEATURED_PROJECTS} aria-pressed={tempSelectedIds.includes(project.id)} aria-label={`${project.name} ${tempSelectedIds.includes(project.id) ? "선택 해제" : "선택"}`} className="absolute top-3 right-3 flex h-11 w-11 items-center justify-center rounded-full border border-white/5 bg-spotify-near-black transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green">
                {tempSelectedIds.includes(project.id) && (
                  <span className="h-6 w-6 rounded-full bg-spotify-green flex items-center justify-center animate-in zoom-in-50 duration-200">
                    <Check className="w-4 h-4 text-black" strokeWidth={3} />
                  </span>
                )}
              </button>

              <div className="space-y-4">
                <div className="pr-10">
                  <h4 className="font-bold text-[17px] text-white transition-colors line-clamp-1">
                    {project.name}
                  </h4>
                  <p className="text-[14px] text-spotify-silver line-clamp-2 mt-2 leading-relaxed min-h-[40px]">
                    {project.description || "설명이 없는 프로젝트예요."}
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
                  <div className="pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-[11px] font-bold text-spotify-silver tracking-wider flex items-center gap-2">
                      포트폴리오용 프로젝트 소개
                      <span className="px-1.5 py-0.5 rounded-md bg-white/5 text-spotify-silver text-[10px]">
                        서식 지원
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
                      README 요약 대신 이 내용이 우선적으로 노출돼요. 직접
                      작성하거나 기존 마크다운 파일을 불러올 수 있어요.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))}
          {filteredProjects.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-spotify-silver font-bold text-lg">
                검색 결과가 없어요.
              </p>
            </div>
          )}
        </div>
      </div>
      <DiscardChangesDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={onClose} restoreFocusRef={searchInputRef} />
    </div>
  );
}
