"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { KeyboardEventHandler, ReactNode, RefObject } from "react";

interface EditorSurfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
  title: string;
  closeLabel: string;
  titleId: string;
  descriptionId?: string;
  titleRef: RefObject<HTMLHeadingElement | null>;
  dialogRef: RefObject<HTMLDivElement | null>;
  onKeyDown: KeyboardEventHandler<HTMLDivElement>;
  children: ReactNode;
  contentClassName?: string;
}

export default function EditorSurface({
  isOpen,
  onClose,
  onSave,
  isSaving,
  isDirty,
  title,
  closeLabel,
  titleId,
  descriptionId,
  titleRef,
  dialogRef,
  onKeyDown,
  children,
  contentClassName = "",
}: EditorSurfaceProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45" aria-hidden="true" />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onKeyDown={onKeyDown}
        className="fixed inset-x-0 bottom-0 z-50 flex h-[min(88dvh,760px)] max-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-spotify-near-black text-white shadow-spotify animate-in slide-in-from-bottom duration-300 md:inset-y-4 md:left-[38%] md:right-4 md:h-auto md:max-h-none md:rounded-lg lg:left-[380px] xl:left-[420px]"
      >
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-spotify-near-black px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={onClose}
              className="flex min-h-11 min-w-11 items-center justify-center rounded-xl transition-colors hover:bg-white/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
              type="button"
              aria-label={closeLabel}
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <div className="min-w-0">
              <h3
                ref={titleRef}
                id={titleId}
                tabIndex={-1}
                className="truncate text-[18px] font-bold leading-tight text-white"
              >
                {title}
              </h3>
              <p
                role="status"
                aria-live="polite"
                className={`mt-0.5 text-[11px] font-bold ${isDirty ? "text-spotify-warning" : "text-spotify-silver"}`}
              >
                {isSaving ? "저장 중…" : isDirty ? "저장 전 변경 있음" : "변경 없음"}
              </p>
            </div>
          </div>
          <Button
            className="btn-pill-primary h-11 shrink-0 px-4 text-[12px] font-bold sm:px-8 sm:text-sm"
            onClick={isDirty ? onSave : onClose}
            disabled={isSaving}
            aria-busy={isSaving}
          >
            {isSaving ? "저장 중…" : isDirty ? "저장하고 닫기" : "닫기"}
          </Button>
        </div>
        <div className={`min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 ${contentClassName}`}>
          {children}
        </div>
      </div>
    </>
  );
}
