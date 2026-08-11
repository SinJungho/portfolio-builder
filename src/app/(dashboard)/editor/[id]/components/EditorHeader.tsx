"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, Loader2, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Link from "next/link";

interface EditorHeaderProps {
  isPublished: boolean;
  lastBlockOrder: boolean;
  onUndoBlockOrder: () => void;
  isSaving: boolean;
  isPreviewing: boolean;
  onTogglePreview: () => void;
  isInspectorOpen: boolean;
  onToggleInspector: () => void;
  saveError: { message: string; retry: () => void } | null;
}

export default function EditorHeader({
  isPublished,
  lastBlockOrder,
  onUndoBlockOrder,
  isSaving,
  isPreviewing,
  onTogglePreview,
  isInspectorOpen,
  onToggleInspector,
  saveError,
}: EditorHeaderProps) {
  const publicationStatus = isPublished
    ? saveError
      ? "공개 중 · 저장 실패"
      : isSaving
        ? "공개 중 · 저장 중"
        : "공개 중 · 최신 저장본"
    : saveError
      ? "초안 · 저장 실패"
      : isSaving
        ? "초안 · 저장 중"
        : "초안 · 최신 저장본";
  const publicationStatusHint = isPublished
    ? saveError
      ? "현재 공개본은 유지돼요. 다시 저장하면 변경사항을 반영할 수 있어요."
      : isSaving
        ? "현재 공개본은 유지되고 저장 완료 후 변경사항이 반영돼요."
        : "현재 저장본이 공개 중이에요."
    : "아직 외부에 공개되지 않은 초안이에요.";

  return (
    <>
      <header className="z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/5 bg-spotify-near-black px-6">
        <h1 className="sr-only">포트폴리오 편집</h1>
        <Link
          href="/dashboard"
          className="flex min-h-11 items-center gap-2 text-[14px] font-bold text-spotify-silver transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
          aria-label="대시보드로 돌아가기"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">대시보드로 돌아가기</span>
        </Link>
        <div className="flex items-center gap-4">
          {lastBlockOrder && (
            <button
              type="button"
              onClick={onUndoBlockOrder}
              disabled={isSaving}
              className="min-h-11 px-2 text-[12px] font-bold text-spotify-green hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green disabled:opacity-50"
            >
              순서 되돌리기
            </button>
          )}
          <button
            type="button"
            onClick={onTogglePreview}
            className="min-h-11 px-2 text-[12px] font-bold text-spotify-near-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green lg:hidden"
          >
            {isPreviewing ? "편집" : "미리보기"}
          </button>
          <button
            type="button"
            onClick={onToggleInspector}
            className="hidden min-h-11 items-center gap-1.5 px-2 text-[12px] font-bold text-spotify-near-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green lg:inline-flex"
            aria-pressed={isInspectorOpen}
          >
            {isInspectorOpen ? <PanelLeftClose className="h-4 w-4" aria-hidden="true" /> : <PanelLeftOpen className="h-4 w-4" aria-hidden="true" />}
            {isInspectorOpen ? "컨트롤 숨기기" : "컨트롤 열기"}
          </button>
          <div className="flex items-center gap-2 text-[12px] font-bold transition-all" role="status" aria-live="polite">
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-spotify-green" aria-hidden="true" />
            ) : !saveError ? (
              <Check className="h-3.5 w-3.5 text-spotify-green" aria-hidden="true" />
            ) : null}
            <span
              className={isPublished ? "text-spotify-green" : "text-spotify-silver"}
              aria-label={publicationStatus}
              title={publicationStatusHint}
            >
              {publicationStatus}
            </span>
          </div>
        </div>
      </header>
      {saveError && (
        <div role="alert" className="fixed inset-x-0 top-14 z-[70] flex items-center justify-between gap-3 border-b border-spotify-negative/30 bg-spotify-near-black px-6 py-3 text-[13px] font-bold text-spotify-negative shadow-spotify">
          <span>{saveError.message}</span>
          <Button size="sm" variant="outline" className="min-h-11 border-spotify-negative/40 bg-transparent text-spotify-negative hover:bg-spotify-negative/10" onClick={saveError.retry}>
            다시 시도
          </Button>
        </div>
      )}
    </>
  );
}
