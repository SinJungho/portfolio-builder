"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { X } from "lucide-react";
import React, { useState } from "react";

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

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      ...initialConfig,
      max_items: maxItems,
      show_thumbnail: showThumbnail,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
      <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
            type="button"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <h3 className="text-[18px] font-bold text-white">
            블로그 피드(Blog) 편집
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
              최대 표시 개수
            </Label>
            <Input
              type="number"
              min="1"
              max="12"
              value={maxItems}
              onChange={(e) => setMaxItems(parseInt(e.target.value) || 1)}
              className="bg-spotify-dark-surface border-white/5 text-white h-12 rounded-xl focus:border-spotify-green"
            />
            <p className="text-[11px] text-spotify-silver pt-1">
              한 번에 표시할 최신 블로그 글의 개수를 설정합니다. (1~12개)
            </p>
          </div>

          <div className="flex items-center justify-between p-4 bg-spotify-dark-surface border border-white/5 rounded-xl mt-4">
            <div className="space-y-0.5">
              <Label className="text-[14px] font-bold text-white">
                썸네일 표시 여부
              </Label>
              <p className="text-[12px] text-spotify-silver">
                블로그 포스트의 썸네일 이미지를 카드에 표시합니다.
              </p>
            </div>
            <Switch
              checked={showThumbnail}
              onCheckedChange={setShowThumbnail}
              className="data-[state=checked]:bg-spotify-green cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
