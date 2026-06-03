"use client";

import React from "react";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type RawProject } from "@/types/project";
import { ProjectSelectionItem } from "./ProjectSelectionItem";

interface ProjectSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tempSelectedIds: string[];
  toggleTempProject: (id: string) => void;
  tempCustomDescriptions: Record<string, string>;
  handleDescriptionChange: (id: string, value: string) => void;
  filteredProjects?: RawProject[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  saveProjectChanges: () => void;
  isSaving: boolean;
}

export const ProjectSelectionModal = React.memo(function ProjectSelectionModal({
  isOpen,
  onClose,
  tempSelectedIds,
  toggleTempProject,
  tempCustomDescriptions,
  handleDescriptionChange,
  filteredProjects,
  searchQuery,
  setSearchQuery,
  saveProjectChanges,
  isSaving,
}: ProjectSelectionModalProps): React.ReactElement | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      {/* 헤더 바 영역 */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 className="text-[18px] font-bold text-white">
            대표 리포지토리 선택 ({tempSelectedIds.length})
          </h3>
        </div>
        <Button
          className="bg-spotify-green hover:scale-105 active:scale-95 text-black rounded-full px-6 font-bold text-sm tracking-spotify transition-all flex items-center justify-center cursor-pointer"
          onClick={saveProjectChanges}
          disabled={isSaving}
        >
          적용하기
        </Button>
      </div>

      {/* 프로젝트 필터 및 목록 영역 */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full">
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-silver" />
            <Input
              placeholder="리포지토리 검색..."
              className="pl-12 h-14 bg-spotify-mid-dark border-white/5 rounded-full text-[16px] text-white placeholder:text-spotify-silver/40 focus:ring-1 focus:ring-spotify-green focus:border-spotify-green transition-all"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* 프로젝트 카드 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects?.map((project: RawProject) => (
            <ProjectSelectionItem
              key={project.id}
              project={project}
              isSelected={tempSelectedIds.includes(project.id)}
              onToggle={toggleTempProject}
              customDescription={
                tempCustomDescriptions[project.id] ||
                project.description ||
                ""
              }
              onDescriptionChange={handleDescriptionChange}
            />
          ))}
          {filteredProjects?.length === 0 && (
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
});
