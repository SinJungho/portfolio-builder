"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { useCloseGuard, DiscardChangesDialog } from "./useCloseGuard";
import EditorSurface from "./EditorSurface";
import { Check, ChevronDown, ChevronUp, GitFork, Search, Star, X } from "lucide-react";
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
  const titleRef = useRef<HTMLHeadingElement>(null);
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

  const filteredProjects = rawProjects
    .filter(
      (project: RawProject) =>
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      const aSelected = tempSelectedIds.indexOf(a.id);
      const bSelected = tempSelectedIds.indexOf(b.id);
      if (aSelected >= 0 || bSelected >= 0) {
        if (aSelected < 0) return 1;
        if (bSelected < 0) return -1;
        return aSelected - bSelected;
      }
      if (Boolean(a.is_featured) !== Boolean(b.is_featured)) return a.is_featured ? -1 : 1;
      return b.stargazers_count - a.stargazers_count;
    });
  const selectedProjects = tempSelectedIds
    .map((id) => rawProjects.find((project) => project.id === id))
    .filter((project): project is RawProject => Boolean(project));

  const toggleTempProject = (id: string) => {
    setTempSelectedIds((prevIds: string[]) =>
      prevIds.includes(id)
        ? prevIds.filter((item: string) => item !== id)
        : prevIds.length < MAX_FEATURED_PROJECTS
          ? [...prevIds, id]
          : prevIds,
    );
  };

  const moveTempProject = (id: string, direction: -1 | 1) => {
    setTempSelectedIds((prevIds) => {
      const index = prevIds.indexOf(id);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= prevIds.length) return prevIds;
      const nextIds = [...prevIds];
      [nextIds[index], nextIds[nextIndex]] = [nextIds[nextIndex], nextIds[index]];
      return nextIds;
    });
  };

  const handleSave = () => {
    // 선택 해제한 프로젝트의 설명은 함께 버린다. 남겨두면 저장 한도(3개)를 넘겨 저장이 막힌다.
    const descriptions = Object.fromEntries(
      Object.entries(tempCustomDescriptions).filter(([id]) => tempSelectedIds.includes(id)),
    );
    onSave(tempSelectedIds, descriptions);
  };

  return (
    <EditorSurface
      isOpen={isOpen}
      onClose={requestClose}
      onSave={handleSave}
      isSaving={isSaving}
      isDirty={isDirty}
      title={`대표 프로젝트 선택 (${tempSelectedIds.length}/${MAX_FEATURED_PROJECTS})`}
      closeLabel="프로젝트 선택 닫기"
      titleId="project-selection-title"
      descriptionId="project-selection-description"
      titleRef={titleRef}
      dialogRef={dialogRef}
      onKeyDown={handleDialogKeyDown}
      contentClassName="mx-auto w-full max-w-5xl"
    >
        {/* 검색 폼 */}
        <div className="mb-8 space-y-4">
          <p id="project-selection-description" className="text-sm font-medium text-spotify-silver">채용 담당자에게 보여줄 대표 프로젝트를 최대 3개 선택하세요. 역할과 결과가 가장 잘 보이는 작업부터 골라 선택한 순서대로 공개해요.</p>
          <p className="sr-only" aria-live="polite">
            대표 프로젝트 {tempSelectedIds.length}개 선택됨, 최대 {MAX_FEATURED_PROJECTS}개
          </p>
          {selectedProjects.length > 0 && (
            <section aria-labelledby="selected-projects-heading" className="rounded-lg border border-spotify-green/20 bg-spotify-green/[0.06] p-4">
              <h3 id="selected-projects-heading" className="text-[12px] font-bold text-spotify-green">
                공개 순서
              </h3>
              <ol className="mt-3 flex flex-wrap gap-2">
                {selectedProjects.map((project, index) => (
                  <li key={project.id} className="flex min-h-11 items-center gap-1 rounded-full border border-white/10 bg-spotify-near-black pl-3 text-[12px] font-bold text-white">
                    <span className="text-spotify-green">{index + 1}</span>
                    <span className="max-w-40 truncate">{project.name}</span>
                    <button type="button" onClick={() => moveTempProject(project.id, -1)} disabled={index === 0} aria-label={`${project.name} 순서 앞으로 이동`} className="flex h-11 w-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green">
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => moveTempProject(project.id, 1)} disabled={index === selectedProjects.length - 1} aria-label={`${project.name} 순서 뒤로 이동`} className="flex h-11 w-9 items-center justify-center rounded-full hover:bg-white/10 disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green">
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => toggleTempProject(project.id)} aria-label={`${project.name} 선택 해제`} className="flex h-11 w-9 items-center justify-center rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green">
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ol>
            </section>
          )}
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
                relative p-6 rounded-lg border transition-all duration-300 group
                ${
                  tempSelectedIds.includes(project.id)
                    ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green/30 text-white shadow-spotify"
                    : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark text-white shadow-spotify"
                }
              `}
            >
              {tempSelectedIds.includes(project.id) && (
                <span className="absolute left-3 top-3 rounded-full bg-spotify-green/15 px-2 py-1 text-[10px] font-bold text-spotify-green">
                  대표 {String(tempSelectedIds.indexOf(project.id) + 1).padStart(2, "0")}
                </span>
              )}

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
      <DiscardChangesDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={onClose} restoreFocusRef={searchInputRef} />
    </EditorSurface>
  );
}
