"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import { type RawProject } from "@/types/project";
import { Check, GitFork, Star } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface ProjectSelectionItemProps {
  project: RawProject;
  isSelected: boolean;
  onToggle: (id: string) => void;
  customDescription: string;
  onDescriptionChange: (id: string, value: string) => void;
}

export const ProjectSelectionItem = React.memo(function ProjectSelectionItem({
  project,
  isSelected,
  onToggle,
  customDescription,
  onDescriptionChange,
}: ProjectSelectionItemProps): React.ReactElement {
  const [localText, setLocalText] = useState<string>(customDescription);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 외부(부모)에서 새로운 설명글이 내려오면 로컬 편집기 상태를 맞춰줍니다.
  useEffect(() => {
    setLocalText(customDescription);
  }, [customDescription]);

  // 컴포넌트가 화면에서 사라질 때 혹시 작동 중일 수 있는 디바운스 타이머를 안전하게 정리합니다.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleTextChange = (value: string): void => {
    setLocalText(value);

    // 0.2초 동안 입력이 멈췄을 때만 부모 상태로 올려서 글자 밀림(랙)을 원천 차단합니다.
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onDescriptionChange(project.id, value);
    }, 200);
  };

  return (
    <Card
      onClick={() => onToggle(project.id)}
      className={`
        relative p-6 cursor-pointer rounded-[28px] border transition-all duration-300 select-none
        ${
          isSelected
            ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green"
            : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark hover:shadow-spotify"
        }
      `}
    >
      <div className="absolute top-5 right-5 h-6 w-6 rounded-full border border-white/10 bg-spotify-mid-dark flex items-center justify-center transition-colors">
        {isSelected && (
          <div className="h-full w-full rounded-full bg-spotify-green flex items-center justify-center animate-in zoom-in-50 duration-200">
            <Check
              className="w-4 h-4 text-black stroke-[3px]"
              strokeWidth={3}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="pr-10">
          <h4 className="font-extrabold text-[17px] text-white line-clamp-1">
            {project.name}
          </h4>
          <p className="text-[14px] text-spotify-silver line-clamp-2 mt-2 leading-relaxed min-h-[40px] font-normal">
            {project.description || "설명이 없는 프로젝트입니다."}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          {project.language && (
            <span className="px-2.5 py-1 rounded-lg bg-spotify-mid-dark border border-white/5 text-[11px] font-bold text-spotify-silver uppercase tracking-wider">
              {project.language}
            </span>
          )}
          <div className="flex items-center gap-4 text-[12px] text-spotify-silver font-bold">
            <div className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-spotify-silver" />
              {project.stargazers_count}
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-3.5 h-3.5 text-spotify-silver" />
              {project.forks_count}
            </div>
          </div>
        </div>

        {isSelected && (
          <div
            className="pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <Label className="text-[11px] font-bold text-spotify-green uppercase tracking-wider flex items-center gap-2">
              나만의 프로젝트 설명 쓰기
              <span className="px-1.5 py-0.5 rounded-md bg-spotify-green/10 text-spotify-green text-[10px]">
                마크다운 지원
              </span>
            </Label>

            <MarkdownEditor value={localText} onChange={handleTextChange} />

            <p className="text-[11px] text-spotify-silver font-medium leading-relaxed font-normal">
              AI가 요약한 리드미(README) 대신 이 설명이 포트폴리오에 우선
              표시됩니다. 나만의 설명이나 핵심 포인트를 마크다운으로 자유롭게
              채워보세요.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
});
