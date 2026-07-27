"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { X, Plus, Trash2 } from "lucide-react";
import React, { useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SkillItem {
  name: string;
  level: number;
}

interface SkillsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
  initialConfig: Record<string, unknown>;
  isSaving: boolean;
}

export default function SkillsEditorModal({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  isSaving,
}: SkillsEditorModalProps) {
  const [chartType, setChartType] = useState<string>(
    (initialConfig.chart_type as string) || "radar",
  );
  const [skills, setSkills] = useState<SkillItem[]>(
    (initialConfig.skills as SkillItem[]) || [],
  );
  const titleRef = useRef<HTMLHeadingElement>(null);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    onClose,
    titleRef,
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...initialConfig,
      chart_type: chartType,
      skills,
    });
  };

  const addSkill = () => {
    setSkills([...skills, { name: "", level: 50 }]);
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkill = (
    index: number,
    field: keyof SkillItem,
    value: string | number,
  ) => {
    const newSkills = [...skills];
    newSkills[index] = { ...newSkills[index], [field]: value };
    setSkills(newSkills);
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="skills-editor-title" onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
            type="button"
            aria-label="기술 스택 편집 닫기"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 ref={titleRef} id="skills-editor-title" tabIndex={-1} className="text-[18px] font-bold text-white">
            기술 스택(Skills) 편집
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

      <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-3xl mx-auto w-full space-y-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-spotify-silver">
              차트 타입
            </Label>
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-full h-12 bg-spotify-dark-surface border-white/5 text-white rounded-xl focus:ring-spotify-green cursor-pointer">
                <SelectValue placeholder="차트 타입을 선택하세요" />
              </SelectTrigger>
              <SelectContent className="bg-spotify-dark-surface border-white/5 text-white rounded-xl">
                <SelectItem value="radar" className="focus:bg-white/5 cursor-pointer">레이더 차트 (Radar)</SelectItem>
                <SelectItem value="bar" className="focus:bg-white/5 cursor-pointer">막대 차트 (Bar)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-spotify-silver">
                보유 기술 ({skills.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={addSkill}
                className="text-spotify-green hover:text-spotify-green hover:bg-spotify-green/10 text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> 항목 추가
              </Button>
            </div>

            <div className="space-y-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 bg-spotify-dark-surface p-3 border border-white/5 rounded-xl"
                >
                  <div className="flex-1 space-y-1">
                    <Input
                      value={skill.name}
                      onChange={(e) => updateSkill(index, "name", e.target.value)}
                      placeholder="기술명 (예: React)"
                      className="bg-transparent border-white/10 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="w-[120px] space-y-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={skill.level}
                      onChange={(e) =>
                        updateSkill(index, "level", parseInt(e.target.value) || 0)
                      }
                      className="bg-transparent border-white/10 text-white h-9 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => removeSkill(index)}
                    className="p-2 text-spotify-silver hover:text-spotify-negative hover:bg-spotify-negative/10 rounded-lg transition-colors cursor-pointer"
                    title="항목 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                <div className="text-center py-8 text-spotify-silver text-sm bg-spotify-dark-surface border border-white/5 rounded-xl">
                  등록된 기술이 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
