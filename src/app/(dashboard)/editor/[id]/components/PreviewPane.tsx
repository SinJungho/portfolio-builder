"use client";

import { Button } from "@/components/ui/button";
import { portfolioUrlLabel } from "@/lib/portfolio-url";
import type { EditorDestination, PortfolioReadinessGroup } from "@/lib/portfolio-readiness";
import type { PortfolioState } from "@/lib/portfolio-state";
import type { DesignTokens } from "@/schemas/portfolio";
import type { Block } from "@/stores/portfolioStore";
import PortfolioPreview from "@/preview/PortfolioPreview";
import { Globe, PanelLeftOpen, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState, type ReactNode, type RefObject } from "react";
import { previewReviewItems } from "./SettingsPanel";

export type PreviewViewport = "desktop" | "tablet" | "mobile";

const previewViewportOptions = [
  { id: "desktop" as const, label: "넓게", icon: Monitor },
  { id: "tablet" as const, label: "태블릿", icon: Tablet },
  { id: "mobile" as const, label: "휴대폰", icon: Smartphone },
];

interface PreviewPaneProps {
  isPreviewing: boolean;
  isInspectorOpen: boolean;
  onOpenInspector: () => void;
  isPublished: boolean;
  slug: string | null;
  customDomain: string | null;
  previewWidth: string;
  previewRef: RefObject<HTMLDivElement | null>;
  projectsLoadFailed: boolean;
  onRetryProjects: () => void;
  mobileStatus: ReactNode;
  previewBlocks: Block[];
  theme: string;
  designTokens: DesignTokens;
  portfolioId: string;
  previewViewport: PreviewViewport;
  onViewportChange: (viewport: PreviewViewport) => void;
  highlightedBlockId: string | null;
  onSelectBlock: (block: Block) => void;
}

export default function PreviewPane({
  isPreviewing,
  isInspectorOpen,
  onOpenInspector,
  isPublished,
  slug,
  customDomain,
  previewWidth,
  previewRef,
  projectsLoadFailed,
  onRetryProjects,
  mobileStatus,
  previewBlocks,
  theme,
  designTokens,
  portfolioId,
  previewViewport,
  onViewportChange,
  highlightedBlockId,
  onSelectBlock,
}: PreviewPaneProps) {
  return (
    <section aria-label="포트폴리오 미리보기 영역" className={`${isPreviewing ? "flex" : "hidden"} relative flex-1 flex-col items-center overflow-y-auto bg-spotify-near-black pt-4 pb-20 lg:flex lg:pt-8 lg:pb-32`}>
      {mobileStatus}
      {projectsLoadFailed && (
        <div role="alert" className="mb-3 hidden w-[calc(100%-3rem)] max-w-[1000px] items-center justify-between gap-3 rounded-lg border border-spotify-negative/30 bg-spotify-negative/10 px-4 py-3 text-[12px] font-bold text-spotify-negative lg:flex">
          <span>GitHub 프로젝트를 불러오지 못했어요. 대표 작업이 비어 보일 수 있어요.</span>
          <Button type="button" size="sm" variant="outline" className="min-h-11 shrink-0 rounded-full border-spotify-negative/40 bg-transparent px-3 text-[11px] text-spotify-negative hover:bg-spotify-negative/10" onClick={onRetryProjects}>
            다시 불러오기
          </Button>
        </div>
      )}
      <div ref={previewRef} role="region" tabIndex={-1} aria-label="포트폴리오 미리보기" style={{ width: `min(${previewWidth}, calc(100% - 3rem))`, maxWidth: previewWidth }} className="relative mx-6 w-[calc(100%-3rem)] overflow-hidden rounded-t-lg bg-spotify-dark-surface shadow-spotify animate-in slide-in-from-bottom-8 fade-in duration-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green md:rounded-lg">
        <div className="flex min-h-10 shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/5 bg-spotify-near-black px-4 py-2">
          <span className="text-[11px] font-bold text-spotify-silver">{isPublished ? "공개됨" : "초안 미리보기"}</span>
          <div className="flex min-w-0 max-w-full items-center gap-2">
            {!isInspectorOpen && (
              <button type="button" onClick={onOpenInspector} className="hidden min-h-11 items-center gap-1 rounded-full bg-white/10 px-2 text-[10px] font-bold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green lg:inline-flex">
                <PanelLeftOpen className="h-3.5 w-3.5" aria-hidden="true" />
                컨트롤
              </button>
            )}
            <div role="group" aria-label="미리보기 화면 크기" className="flex items-center gap-1 rounded-full bg-spotify-mid-dark p-1">
              {previewViewportOptions.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-pressed={previewViewport === id}
                  aria-label={`${label} 미리보기`}
                  title={`${label} 미리보기`}
                  onClick={() => onViewportChange(id)}
                  className={`flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full px-2 text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${previewViewport === id ? "bg-white text-black" : "text-spotify-silver hover:bg-white/10 hover:text-white"}`}
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden lg:inline">{label}</span>
                </button>
              ))}
            </div>
            <div className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-white/5 bg-spotify-mid-dark px-4 py-1 font-mono text-[11px] text-spotify-silver shadow-inner">
              <Globe className="h-3.5 w-3.5 text-spotify-silver/50" aria-hidden="true" />
              <span className="min-w-0 truncate">{slug ? portfolioUrlLabel(slug, customDomain) : "주소 준비 중"}</span>
            </div>
          </div>
        </div>
        <div className="h-full min-h-[800px] w-full overflow-hidden bg-white">
          <PortfolioPreview
            blocks={previewBlocks}
            theme={theme}
            designTokens={designTokens}
            slug={undefined}
            portfolioId={portfolioId}
            highlightedBlockId={highlightedBlockId}
            previewViewport={previewViewport}
            onSelectBlock={onSelectBlock}
          />
        </div>
      </div>
    </section>
  );
}

interface MobilePreviewStatusProps {
  portfolioState: PortfolioState;
  readinessGroups: PortfolioReadinessGroup[];
  projectsLoading: boolean;
  projectsLoadFailed: boolean;
  hasReviewedPreview: boolean;
  isSaving: boolean;
  hasSaveError: boolean;
  onAction: (destination: EditorDestination) => void;
  onRetryProjects: () => void;
  onReturnToPublish: () => void;
  onReviewPreview: () => void;
}

export function MobilePreviewStatus({
  portfolioState,
  readinessGroups,
  projectsLoading,
  projectsLoadFailed,
  hasReviewedPreview,
  isSaving,
  hasSaveError,
  onAction,
  onRetryProjects,
  onReturnToPublish,
  onReviewPreview,
}: MobilePreviewStatusProps) {
  const nextGroup = projectsLoading ? undefined : readinessGroups.find((group) => !group.complete);
  const [reviewChecks, setReviewChecks] = useState<boolean[]>(() => previewReviewItems.map(() => hasReviewedPreview));
  const reviewReady = hasReviewedPreview || reviewChecks.every(Boolean);
  const totalSteps = readinessGroups.length;
  const completeCount = readinessGroups.filter((group) => group.complete).length;
  const publicationStatus = portfolioState === "published"
    ? hasSaveError
      ? "공개 중 · 저장 실패"
      : isSaving
        ? "공개 중 · 저장 중"
        : "공개 중 · 최신 저장본"
    : hasSaveError
      ? "초안 · 저장 실패"
      : isSaving
        ? "초안 · 저장 중"
        : "초안 · 최신 저장본";

  return (
    <div className="mb-3 flex w-[calc(100%-3rem)] max-w-[1000px] flex-wrap items-center justify-between gap-3 rounded-lg bg-spotify-dark-surface px-4 py-3 shadow-spotify lg:hidden">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-white">
          {portfolioState === "published" ? publicationStatus : projectsLoading ? "공개 준비 확인 중" : totalSteps ? `공개 준비 ${completeCount}/${totalSteps}` : "공개 준비 완료"}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-spotify-silver">
          {portfolioState === "published"
            ? "저장된 변경사항은 저장 완료 후 공개 페이지에 반영돼요."
            : projectsLoading
              ? "GitHub 프로젝트 상태를 확인하고 있어요."
              : nextGroup
                ? `${nextGroup.label}을(를) 준비해주세요.`
                : hasReviewedPreview
                  ? "공개할 준비가 됐어요."
                  : "미리보기 확인은 선택사항이에요."}
        </p>
      </div>
      {projectsLoadFailed ? (
        <Button size="sm" variant="ghost" className="min-h-11 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={onRetryProjects}>
          다시 불러오기
        </Button>
      ) : nextGroup ? (
        <Button size="sm" variant="ghost" className="min-h-11 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={() => onAction(nextGroup.destination)}>
          {nextGroup.action}
        </Button>
      ) : !projectsLoading && !projectsLoadFailed && portfolioState !== "published" ? (
        <Button size="sm" variant="ghost" className="min-h-11 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={onReturnToPublish}>
          공개 준비로 돌아가 공개하기
        </Button>
      ) : null}
      {!projectsLoading && !projectsLoadFailed && !nextGroup && portfolioState !== "published" && (
        <details className="order-3 w-full rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2">
          <summary className="cursor-pointer text-[11px] font-bold text-spotify-silver focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green">
            검토 체크 3개 {hasReviewedPreview ? "· 완료" : "· 선택"}
          </summary>
          <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-spotify-silver">
            {previewReviewItems.map((item, index) => (
              <li key={item}>
                <label className="flex min-h-11 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={hasReviewedPreview || reviewChecks[index]}
                    disabled={hasReviewedPreview}
                    onChange={(event) => setReviewChecks((current) => current.map((checked, itemIndex) => itemIndex === index ? event.target.checked : checked))}
                    className="h-4 w-4 shrink-0 accent-spotify-green"
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="text-[11px] leading-relaxed text-spotify-silver/80">모바일에서도 바로 체크할 수 있어요.</p>
            {!hasReviewedPreview && (
              <Button type="button" size="sm" variant="ghost" className="min-h-11 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" disabled={!reviewReady} onClick={onReviewPreview}>
                확인 완료
              </Button>
            )}
          </div>
        </details>
      )}
    </div>
  );
}
