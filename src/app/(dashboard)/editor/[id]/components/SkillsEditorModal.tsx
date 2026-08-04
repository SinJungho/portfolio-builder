"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { useCloseGuard, DiscardChangesDialog } from "./useCloseGuard";
import { X, Plus, Trash2 } from "lucide-react";
import React, { useRef, useState } from "react";

interface SkillItem {
  name: string;
  level: number;
}

const SKILL_TIERS = [
  { label: "기초", value: 30 },
  { label: "사용 가능", value: 60 },
  { label: "능숙", value: 85 },
] as const;

const levelToTierValue = (level: number) =>
  SKILL_TIERS.reduce((best, tier) =>
    Math.abs(tier.value - level) < Math.abs(best.value - level) ? tier : best,
  ).value;

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
  const [skills, setSkills] = useState<SkillItem[]>(
    (initialConfig.skills as SkillItem[]) || [],
  );
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isDirty =
    JSON.stringify(skills) !== JSON.stringify((initialConfig.skills as SkillItem[]) || []);
  const { requestClose, confirmOpen, setConfirmOpen } = useCloseGuard(isDirty, onClose);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    requestClose,
    titleRef,
  );

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...initialConfig,
      skills,
    });
  };

  const addSkill = () => {
    setSkills([...skills, { name: "", level: 60 }]);
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
            onClick={requestClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
            type="button"
            aria-label="기술 스택 편집 닫기"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 ref={titleRef} id="skills-editor-title" tabIndex={-1} className="text-[18px] font-bold text-white">
            기술 스택 편집
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
                      aria-label={`기술 ${index + 1} 이름`}
                      className="bg-transparent border-white/10 text-white h-9 text-sm"
                    />
                  </div>
                  <div className="w-[130px] shrink-0">
                    <Select
                      value={String(levelToTierValue(skill.level))}
                      onValueChange={(value) =>
                        updateSkill(index, "level", Number(value))
                      }
                    >
                      <SelectTrigger
                        aria-label={`기술 ${index + 1} 숙련도`}
                        className="h-9 rounded-lg border-white/10 bg-transparent text-sm text-white"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-white/5 bg-spotify-dark-surface text-white">
                        {SKILL_TIERS.map((tier) => (
                          <SelectItem key={tier.value} value={String(tier.value)}>
                            {tier.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="p-2 text-spotify-silver hover:text-spotify-negative hover:bg-spotify-negative/10 rounded-lg transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
                    title="항목 삭제"
                    aria-label={`기술 ${index + 1} 항목 삭제`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && (
                <div className="text-center py-8 text-spotify-silver text-sm bg-spotify-dark-surface border border-white/5 rounded-xl">
                  등록된 기술이 없어요.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <DiscardChangesDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={onClose} restoreFocusRef={titleRef} />
    </div>
  );
}
