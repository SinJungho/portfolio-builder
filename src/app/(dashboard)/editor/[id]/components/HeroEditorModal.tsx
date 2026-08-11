"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { useCloseGuard, DiscardChangesDialog } from "./useCloseGuard";
import EditorSurface from "./EditorSurface";
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
  const [validationError, setValidationError] = useState<string | null>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isDirty =
    headline !== ((initialConfig.headline as string) || "") ||
    subheadline !== ((initialConfig.subheadline as string) || "") ||
    bio !== ((initialConfig.bio as string) || "") ||
    showStats !== ((initialConfig.show_github_stats as boolean) ?? true);
  const { requestClose, confirmOpen, setConfirmOpen } = useCloseGuard(isDirty, onClose);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    requestClose,
    titleRef,
  );

  const handleSave = () => {
    const missing = [
      !headline.trim() && "한 줄 제목",
      !subheadline.trim() && "짧은 소개",
    ].filter(Boolean);
    if (missing.length > 0) {
      setValidationError(`${missing.join(", ")}을(를) 먼저 작성해 주세요.`);
      return;
    }
    // 기존 값이 한도를 넘겨 저장돼 있으면 maxLength로는 못 막는다.
    const tooLong = [
      headline.length > 100 && "한 줄 제목(100자)",
      subheadline.length > 200 && "짧은 소개(200자)",
      bio.length > 500 && "자기소개(500자)",
    ].filter(Boolean);
    if (tooLong.length > 0) {
      setValidationError(`${tooLong.join(", ")} 길이를 줄여 주세요.`);
      return;
    }
    setValidationError(null);
    onSave({
      ...initialConfig,
      headline,
      subheadline,
      bio,
      show_github_stats: showStats,
    });
  };

  return (
    <EditorSurface
      isOpen={isOpen}
      onClose={requestClose}
      onSave={handleSave}
      isSaving={isSaving}
      isDirty={isDirty}
      title="소개 화면 편집"
      closeLabel="소개 화면 편집 닫기"
      titleId="hero-editor-title"
      descriptionId="hero-editor-description"
      titleRef={titleRef}
      dialogRef={dialogRef}
      onKeyDown={handleDialogKeyDown}
      contentClassName="mx-auto w-full max-w-3xl space-y-8"
    >
        <p id="hero-editor-description" className="rounded-lg border border-spotify-green/20 bg-spotify-green/[0.06] px-4 py-3 text-[13px] leading-relaxed text-spotify-silver">
          GitHub 프로필 정보가 있으면 초안으로 채워져요. 비어 있는 내용은 아래 예시를 참고해 짧게 작성하면 돼요.
        </p>
        {validationError && (
          <p role="alert" className="rounded-xl border border-spotify-negative/30 bg-spotify-negative/10 px-4 py-3 text-[13px] font-bold text-spotify-negative">
            {validationError}
          </p>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="hero-headline" className="text-xs font-bold text-spotify-silver">
              한 줄 제목
            </Label>
            <Input
              id="hero-headline"
              value={headline}
              maxLength={100}
              aria-invalid={Boolean(validationError && !headline.trim())}
              required
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
              maxLength={200}
              aria-invalid={Boolean(validationError && !subheadline.trim())}
              required
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
              maxLength={500}
              onChange={(e) => setBio(e.target.value)}
              placeholder="본인에 대한 상세한 소개를 작성해 주세요."
              className="w-full bg-spotify-dark-surface border border-white/5 text-white p-4 rounded-xl focus:border-spotify-green outline-none min-h-[150px] resize-y"
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-spotify-dark-surface border border-white/5 rounded-xl mt-4">
            <div className="space-y-0.5">
              <Label htmlFor="hero-show-stats" className="text-[14px] font-bold text-white">
                GitHub 통계를 보여줄까요?
              </Label>
              <p className="text-[12px] text-spotify-silver">
                커밋, PR 수 등의 통계를 소개 화면에 보여줘요.
              </p>
            </div>
            <Switch
              id="hero-show-stats"
              aria-label="GitHub 통계 표시"
              checked={showStats}
              onCheckedChange={setShowStats}
              className="data-[state=checked]:bg-spotify-green cursor-pointer"
            />
          </div>
        </div>
      <DiscardChangesDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={onClose} restoreFocusRef={titleRef} />
    </EditorSurface>
  );
}
