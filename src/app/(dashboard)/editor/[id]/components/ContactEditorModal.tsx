"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { useCloseGuard, DiscardChangesDialog } from "./useCloseGuard";
import EditorSurface from "./EditorSurface";
import { useRef, useState } from "react";

interface ContactEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
  initialConfig: Record<string, unknown>;
  isSaving: boolean;
}

export default function ContactEditorModal({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  isSaving,
}: ContactEditorModalProps) {
  const [email, setEmail] = useState<string>((initialConfig.email as string) || "");
  const [linkedin, setLinkedin] = useState<string>((initialConfig.linkedin_url as string) || "");
  const [website, setWebsite] = useState<string>((initialConfig.website_url as string) || "");
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isDirty =
    email !== ((initialConfig.email as string) || "") ||
    linkedin !== ((initialConfig.linkedin_url as string) || "") ||
    website !== ((initialConfig.website_url as string) || "");
  const { requestClose, confirmOpen, setConfirmOpen } = useCloseGuard(isDirty, onClose);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    requestClose,
    titleRef,
  );

  // 스킴 없는 URL(linkedin.com/in/x)은 포트폴리오에서 깨진 상대 링크가 되므로 저장 시 https:// 보정
  const normalizeUrl = (v: string) => {
    const t = v.trim();
    if (!t) return "";
    return /^https?:\/\//i.test(t) ? t : `https://${t}`;
  };

  const handleSave = () => {
    onSave({
      ...initialConfig,
      email: email.trim(),
      linkedin_url: normalizeUrl(linkedin),
      website_url: normalizeUrl(website),
    });
  };

  return (
    <EditorSurface
      isOpen={isOpen}
      onClose={requestClose}
      onSave={handleSave}
      isSaving={isSaving}
      isDirty={isDirty}
      title="연락처 편집"
      closeLabel="연락처 편집 닫기"
      titleId="contact-editor-title"
      descriptionId="contact-editor-description"
      titleRef={titleRef}
      dialogRef={dialogRef}
      onKeyDown={handleDialogKeyDown}
      contentClassName="mx-auto w-full max-w-3xl space-y-8"
    >
        <p id="contact-editor-description" className="text-[13px] font-medium leading-relaxed text-spotify-silver">
          채용 담당자가 연락할 수 있도록 아래 정보를 채워보세요. 모두 선택 사항이지만, 하나 이상 있으면 신뢰를 줄 수 있어요.
        </p>
        <div className="space-y-6">
          {typeof initialConfig.github_url === "string" && initialConfig.github_url && (
            // GitHub 링크는 생성기가 자동으로 채우며, 이 값만으로도 "연락처"가 완료로 인정된다.
            // 편집 필드가 비어 보여 "왜 완료지?" 하는 혼란을 막기 위해 자동 연결된 값을 읽기 전용으로 보여준다.
            <div className="space-y-2">
              <Label className="text-xs font-bold text-spotify-silver">GitHub</Label>
              <div className="flex items-center gap-3 bg-spotify-dark-surface border border-white/5 rounded-xl h-12 px-4">
                <span className="flex-1 truncate text-[14px] font-medium text-white">
                  {initialConfig.github_url as string}
                </span>
                <span className="shrink-0 text-[11px] font-bold text-spotify-green">자동 연결됨</span>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-xs font-bold text-spotify-silver">
              이메일
            </Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="contact@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green placeholder:text-spotify-silver/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-linkedin" className="text-xs font-bold text-spotify-silver">
              LinkedIn URL
            </Label>
            <Input
              id="contact-linkedin"
              type="url"
              placeholder="https://linkedin.com/in/..."
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green placeholder:text-spotify-silver/80"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-website" className="text-xs font-bold text-spotify-silver">
              개인 웹사이트
            </Label>
            <Input
              id="contact-website"
              type="url"
              placeholder="https://..."
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green placeholder:text-spotify-silver/80"
            />
          </div>
        </div>
      <DiscardChangesDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={onClose} restoreFocusRef={titleRef} />
    </EditorSurface>
  );
}
