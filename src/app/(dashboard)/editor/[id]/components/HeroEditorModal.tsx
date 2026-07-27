"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { X } from "lucide-react";
import React, { useRef, useState } from "react";

interface HeroEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
  initialConfig: Record<string, unknown>;
  isSaving: boolean;
}

export default function HeroEditorModal({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  isSaving,
}: HeroEditorModalProps) {
  const [headline, setHeadline] = useState<string>(
    (initialConfig.headline as string) || "",
  );
  const [subheadline, setSubheadline] = useState<string>(
    (initialConfig.subheadline as string) || "",
  );
  const [bio, setBio] = useState<string>((initialConfig.bio as string) || "");
  const [showStats, setShowStats] = useState<boolean>(
    (initialConfig.show_github_stats as boolean) ?? true,
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
      headline,
      subheadline,
      bio,
      show_github_stats: showStats,
    });
  };

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="hero-editor-title" onKeyDown={handleDialogKeyDown} className="fixed inset-0 z-50 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
            type="button"
            aria-label="소개 화면 편집 닫기"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 ref={titleRef} id="hero-editor-title" tabIndex={-1} className="text-[18px] font-bold text-white">
            소개 화면 편집
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-headline" className="text-xs font-bold text-spotify-silver">
              한 줄 제목
            </Label>
            <Input
              id="hero-headline"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="예: 이름 또는 직무"
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-subheadline" className="text-xs font-bold text-spotify-silver">
              짧은 소개
            </Label>
            <Input
              id="hero-subheadline"
              value={subheadline}
              onChange={(e) => setSubheadline(e.target.value)}
              placeholder="직군 + 핵심 기술 + 강점 형태의 짧은 소개글"
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hero-bio" className="text-xs font-bold text-spotify-silver">
              자기소개
            </Label>
            <textarea
              id="hero-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="본인에 대한 상세한 소개를 작성해주세요."
              className="w-full bg-spotify-dark-surface border border-white/5 text-white p-4 rounded-xl focus:border-spotify-green outline-none min-h-[150px] resize-y"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-spotify-dark-surface border border-white/5 rounded-xl mt-4">
            <div className="space-y-0.5">
              <Label className="text-[14px] font-bold text-white">
                GitHub 통계 표시
              </Label>
              <p className="text-[12px] text-spotify-silver">
                커밋, PR 수 등의 통계를 소개 화면에 보여줍니다.
              </p>
            </div>
            <Switch
              checked={showStats}
              onCheckedChange={setShowStats}
              className="data-[state=checked]:bg-spotify-green cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
