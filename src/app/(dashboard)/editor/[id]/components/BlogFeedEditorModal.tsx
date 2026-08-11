"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDialogAccessibility } from "@/components/common/useDialogAccessibility";
import { useCloseGuard, DiscardChangesDialog } from "./useCloseGuard";
import EditorSurface from "./EditorSurface";
import { Switch } from "@/components/ui/switch";
import React, { useRef, useState } from "react";

interface BlogFeedEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: Record<string, unknown>) => void;
  initialConfig: Record<string, unknown>;
  isSaving: boolean;
}

export default function BlogFeedEditorModal({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  isSaving,
}: BlogFeedEditorModalProps) {
  const [maxItems, setMaxItems] = useState<number>(
    (initialConfig.max_items as number) || 4,
  );
  const [showThumbnail, setShowThumbnail] = useState<boolean>(
    (initialConfig.show_thumbnail as boolean) ?? true,
  );
  const titleRef = useRef<HTMLHeadingElement>(null);
  const isDirty =
    maxItems !== ((initialConfig.max_items as number) || 4) ||
    showThumbnail !== ((initialConfig.show_thumbnail as boolean) ?? true);
  const { requestClose, confirmOpen, setConfirmOpen } = useCloseGuard(isDirty, onClose);
  const { dialogRef, handleDialogKeyDown } = useDialogAccessibility(
    isOpen,
    requestClose,
    titleRef,
  );

  const handleSave = () => {
    onSave({
      ...initialConfig,
      max_items: maxItems,
      show_thumbnail: showThumbnail,
    });
  };

  return (
    <EditorSurface
      isOpen={isOpen}
      onClose={requestClose}
      onSave={handleSave}
      isSaving={isSaving}
      isDirty={isDirty}
      title="블로그 피드 편집"
      closeLabel="블로그 피드 편집 닫기"
      titleId="blog-feed-editor-title"
      descriptionId="blog-feed-editor-description"
      titleRef={titleRef}
      dialogRef={dialogRef}
      onKeyDown={handleDialogKeyDown}
      contentClassName="mx-auto w-full max-w-3xl space-y-8"
    >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="blog-max-items" className="text-xs font-bold text-spotify-silver">
              몇 개까지 보여줄까요?
            </Label>
            <Input
              id="blog-max-items"
              type="number"
              min="1"
              max="6"
              value={maxItems}
              onChange={(e) => setMaxItems(Math.min(6, Math.max(1, parseInt(e.target.value) || 1)))}
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green"
            />
            <p id="blog-feed-editor-description" className="text-[11px] text-spotify-silver pt-1">
              최신 글부터 최대 6개까지 보여줄 수 있어요.
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-spotify-dark-surface border border-white/5 rounded-xl mt-4">
            <div className="space-y-0.5">
              <Label htmlFor="blog-show-thumbnail" className="text-[14px] font-bold text-white">
                썸네일을 보여줄까요?
              </Label>
              <p className="text-[12px] text-spotify-silver">
                블로그 포스트의 썸네일 이미지를 카드에 표시해요.
              </p>
            </div>
            <Switch
              id="blog-show-thumbnail"
              aria-label="블로그 썸네일 표시"
              checked={showThumbnail}
              onCheckedChange={setShowThumbnail}
              className="data-[state=checked]:bg-spotify-green cursor-pointer"
            />
          </div>
        </div>
      <DiscardChangesDialog open={confirmOpen} onOpenChange={setConfirmOpen} onConfirm={onClose} restoreFocusRef={titleRef} />
    </EditorSurface>
  );
}
