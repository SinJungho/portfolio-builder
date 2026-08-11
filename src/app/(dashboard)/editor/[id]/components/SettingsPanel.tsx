"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { type PortfolioInitialData, type PublishedSnapshot } from "@/types/portfolio";
import type { DesignTokens } from "@/schemas/portfolio";
import { buildPortfolioCss } from "@/preview/export-css";
import { getPortfolioState, portfolioStateLabel } from "@/lib/portfolio-state";
import { portfolioUrl, portfolioUrlLabel } from "@/lib/portfolio-url";
import { errorMessage } from "@/lib/api/errors";
import { type EditorDestination, type PortfolioReadinessGroup } from "@/lib/portfolio-readiness";
import CustomDomainSection from "./CustomDomainSection";
import { ArrowUpRight, Check, Copy, Eye, FileDown, Globe, Loader2, RefreshCw } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export const previewReviewItems = [
  "첫 화면에서 직무와 강점이 바로 보이나요?",
  "대표 프로젝트가 역할과 결과를 설명하나요?",
  "연락할 방법이 한눈에 보이나요?",
] as const;

interface SettingsPanelProps {
  initialData: PortfolioInitialData;
  theme: string;
  designTokens: DesignTokens;
  customDomain: string | null;
  portfolioState: ReturnType<typeof getPortfolioState>;
  isSaving: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  readinessGroups: PortfolioReadinessGroup[];
  projectsLoading: boolean;
  projectsLoadFailed: boolean;
  onRetryProjects: () => void;
  onReadinessAction: (destination: EditorDestination) => void;
  onPreview: () => void;
  previewOpened: boolean;
  hasReviewedPreview: boolean;
  hasReviewedOnce: boolean;
  onReviewPreview: () => void;
  justPublished: boolean;
  publishedSnapshot: PublishedSnapshot | null;
  onRestorePublished: () => void;
}

const SettingsPanel = React.memo(function SettingsPanel({
  initialData,
  theme,
  designTokens,
  customDomain,
  portfolioState,
  isSaving,
  onPublish,
  onUnpublish,
  readinessGroups,
  projectsLoading,
  projectsLoadFailed,
  onRetryProjects,
  onReadinessAction,
  onPreview,
  previewOpened,
  hasReviewedPreview,
  hasReviewedOnce,
  onReviewPreview,
  justPublished,
  publishedSnapshot,
  onRestorePublished,
}: SettingsPanelProps) {
  const publishedPath = initialData.slug
    ? portfolioUrl(initialData.slug, customDomain)
    : null;
  const nextGroup = readinessGroups.find((group) => !group.complete);
  const readinessSettled = !projectsLoading && !projectsLoadFailed;
  const actionableNextGroup = readinessSettled ? nextGroup : undefined;
  const pendingReadinessGroups = readinessGroups.filter((group) => !group.complete);
  const [reviewChecks, setReviewChecks] = React.useState<boolean[]>(() =>
    previewReviewItems.map(() => hasReviewedPreview),
  );
  const reviewReady = hasReviewedPreview || reviewChecks.every(Boolean);

  React.useEffect(() => {
    if (!previewOpened && !hasReviewedPreview) {
      setReviewChecks(previewReviewItems.map(() => false));
    }
  }, [hasReviewedPreview, previewOpened]);

  // 공개 조건과 진행도를 같은 기준으로 계산한다.
  const totalSteps = readinessGroups.length;
  const completedSteps = readinessGroups.filter((group) => group.complete).length;
  const progressPct = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : 100;
  const currentStepLabel = projectsLoading
    ? "GitHub 프로젝트 확인"
    : projectsLoadFailed
      ? "GitHub 프로젝트 다시 불러오기"
    : nextGroup?.label ?? (!hasReviewedPreview ? "미리보기 확인 (선택)" : "공개");
  const previewIsNext = readinessSettled && !nextGroup && !hasReviewedPreview;
  const readyToPublish = readinessSettled && !nextGroup;
  const previewStale = previewIsNext && hasReviewedOnce;
  const readinessLead = (() => {
    switch (true) {
      case projectsLoading:
        return "GitHub 프로젝트를 확인하고 있어요. 확인이 끝나면 대표 작업 준비 상태를 정확히 보여드릴게요.";
      case projectsLoadFailed:
        return "GitHub 프로젝트를 불러오지 못했어요. 다시 불러오면 대표 작업 준비 상태를 이어서 확인할 수 있어요.";
      case portfolioState === "published":
        return "공개 중이에요. 필요한 준비를 모두 마쳤어요.";
      case completedSteps === 0:
        return "GitHub에서 불러온 내용으로 시작해요. 아래를 채우면 지원서에 넣을 링크가 완성돼요.";
      case previewStale:
        return "내용을 바꿨네요. 미리보기를 다시 확인하면 좋아요. 확인하지 않아도 공개할 수 있어요.";
      case readyToPublish && !hasReviewedPreview:
        return "필수 준비를 모두 마쳤어요. 바로 공개하거나 미리보기를 확인할 수 있어요.";
      case readyToPublish:
        return "준비가 끝났어요. 링크를 만들어 지원서에 넣어보세요.";
      case previewIsNext:
        return "마지막으로 미리보기만 확인하면 공개할 수 있어요.";
      case totalSteps - completedSteps === 1:
        return "거의 다 왔어요. 한 가지만 더 채우면 공개할 수 있어요.";
      default:
        return "좋아요, 순조롭게 채워지고 있어요. 남은 항목을 이어가 볼까요?";
    }
  })();
  const copyPublishedLink = async () => {
    if (!initialData.slug) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl(initialData.slug, customDomain));
      toast.success("지원서용 링크를 복사했어요.");
    } catch {
      toast.error(errorMessage("LINK_COPY_FAILED"));
    }
  };

  const exportCss = () => {
    const blob = new Blob([buildPortfolioCss(theme, designTokens)], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${initialData.slug || "portfolioforge"}-theme.css`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("디자인 파일을 내려받았어요.");
  };

  return (
    <div className="space-y-6">
      {justPublished && portfolioState === "published" && (
        <div className="rounded-lg border border-spotify-green/30 bg-spotify-green/[0.07] p-6 shadow-spotify text-white space-y-5 animate-in fade-in zoom-in-95 duration-500 motion-reduce:animate-none">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-spotify-green text-black">
              <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold tracking-tight text-white">공개됐어요</h2>
            <p className="text-[12px] font-medium text-spotify-silver">현재 저장된 포트폴리오가 이 주소에 공개됐어요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/30 px-3 py-2.5">
            <Globe className="w-4 h-4 shrink-0 text-spotify-green" aria-hidden="true" />
            <span className="truncate font-mono text-[13px] font-bold text-white">
              {initialData.slug ? portfolioUrlLabel(initialData.slug, customDomain) : "주소 준비 중"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="btn-pill-primary h-11 flex-1 text-[13px]" onClick={copyPublishedLink}>
                  <Copy className="w-4 h-4" aria-hidden="true" /> 지원서용 링크 복사
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full bg-white/10 px-4 text-[13px] font-bold text-white hover:bg-white/15"
              onClick={() => initialData.slug && window.open(portfolioUrl(initialData.slug, customDomain), "_blank")}
            >
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" /> 열기
            </Button>
          </div>
        </div>
      )}
      <div className="bg-spotify-dark-surface border border-white/5 rounded-lg p-6 shadow-spotify text-white space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-spotify-green" aria-hidden="true" />
              공개 준비
            </h2>
            <span className="text-[12px] font-bold text-spotify-silver tabular-nums" aria-hidden="true">
              {projectsLoading ? "확인 중" : `${completedSteps}/${totalSteps}`}
            </span>
          </div>
          <div
            role="progressbar"
            aria-label="공개 준비도"
            aria-valuemin={0}
            aria-valuemax={totalSteps}
            aria-valuenow={completedSteps}
            className="h-1.5 overflow-hidden rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-spotify-green transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-[12px] text-spotify-silver font-medium leading-relaxed">
            {readinessLead}
          </p>
        </div>

        {portfolioState !== "published" && (
          <div className="flex items-center justify-between gap-3 rounded-lg border border-spotify-green/20 bg-spotify-green/[0.06] px-4 py-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold tracking-wide text-spotify-green">지금 할 일</p>
              <p className="mt-1 text-[13px] font-bold leading-snug text-white">{currentStepLabel}</p>
              {actionableNextGroup && (
                <p className="mt-1 text-[11px] leading-relaxed text-spotify-silver">
                  {actionableNextGroup.description}{actionableNextGroup.missingItems.length ? ` · 남은 항목: ${actionableNextGroup.missingItems.map((item) => item.label).join(" · ")}` : ""}
                </p>
              )}
            </div>
            {projectsLoadFailed ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="btn-pill-primary min-h-11 shrink-0 px-3 text-[11px]"
                onClick={onRetryProjects}
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                다시 불러오기
              </Button>
            ) : actionableNextGroup ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="btn-pill-primary min-h-11 shrink-0 px-3 text-[11px]"
                onClick={() => onReadinessAction(actionableNextGroup.destination)}
              >
                    {actionableNextGroup.action}
              </Button>
            ) : previewIsNext ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="btn-pill-primary min-h-11 shrink-0 px-3 text-[11px]"
                onClick={previewOpened && reviewReady ? onReviewPreview : onPreview}
                disabled={previewOpened && !reviewReady}
                aria-describedby="preview-review-status"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                {previewOpened ? reviewReady ? "검토 완료" : "세 가지 확인하기" : "미리보기 열기"}
              </Button>
            ) : (
              <span className="shrink-0 text-[11px] font-medium text-spotify-silver">공개할 수 있어요</span>
            )}
          </div>
        )}

        {(previewIsNext || previewOpened || hasReviewedPreview) && (
        <section aria-labelledby="preview-checklist-title" className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
          <h3 id="preview-checklist-title" className="text-[13px] font-bold text-white">
            공개 전에 미리보기로 확인해요 <span className="font-medium text-spotify-silver">(선택)</span>
          </h3>
          <ul className="mt-3 space-y-2 text-[12px] leading-relaxed text-spotify-silver">
            {previewReviewItems.map((item, index) => (
              <li key={item}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/[0.04]">
                  <input
                    type="checkbox"
                    checked={hasReviewedPreview || Boolean(reviewChecks[index])}
                    disabled={!previewOpened || hasReviewedPreview}
                    onChange={(event) => {
                      setReviewChecks((current) => current.map((checked, itemIndex) => itemIndex === index ? event.target.checked : checked));
                    }}
                    className="h-4 w-4 shrink-0 accent-spotify-green"
                  />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
          <p id="preview-review-status" className="mt-3 text-[11px] leading-relaxed text-spotify-silver/80">
            {!previewOpened
              ? "게시 전에 확인하면 좋아요. 미리보기 확인은 선택사항이에요."
              : reviewReady
                ? "세 가지를 확인했어요. 이제 공개하거나 내용을 더 다듬을 수 있어요."
                : "확인할 항목을 골라 체크해 보세요. 모두 확인하지 않아도 공개할 수 있어요."}
          </p>
        </section>
        )}

        {pendingReadinessGroups.length > 1 && (
          <p className="text-[11px] leading-relaxed text-spotify-silver/80">
            현재 단계를 완료하면 다음 준비 단계가 열려요. 남은 준비 {pendingReadinessGroups.length}개
          </p>
        )}

        {portfolioState !== "published" && (
          <div className="space-y-3 border-t border-white/5 pt-5">
            {!readyToPublish && (
              <p className="text-[13px] font-bold leading-relaxed text-white">
                위 준비 항목을 마치면 지원서용 링크를 만들 수 있어요.
              </p>
            )}
            <Button
              type="button"
              className={readyToPublish
                ? "btn-pill-primary h-12 w-full text-[14px]"
                : "h-12 w-full rounded-full border border-white/10 bg-white/[0.04] text-[14px] font-bold text-spotify-silver hover:bg-white/[0.08]"}
              disabled={isSaving || !readyToPublish}
              onClick={onPublish}
              aria-describedby="publish-status"
              aria-label={isSaving ? "포트폴리오 공개 중" : "포트폴리오 공개하기"}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Globe className="w-4 h-4" aria-hidden="true" />
              )}
              포트폴리오 공개하기
            </Button>
            <p id="publish-status" className="text-[11px] leading-relaxed text-spotify-silver">
              {readyToPublish
                ? "저장된 변경사항은 저장 완료 후 공개 페이지에 반영돼요."
                : projectsLoadFailed
                  ? "GitHub 프로젝트를 다시 불러오면 다음 단계가 열려요."
                  : nextGroup
                    ? `${nextGroup.label}을(를) 준비하면 공개할 수 있어요.`
                    : "미리보기를 확인하면 공개할 수 있어요."}
            </p>
          </div>
        )}

        {!justPublished && <details open={portfolioState === "published"} className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
            주소와 공개 상태
          </summary>
          <div className="mt-4 space-y-2">
            <Label className="text-[10px] font-bold text-spotify-silver tracking-wider">
              기본 주소
            </Label>
          <div className="flex flex-col gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-spotify-green shrink-0" aria-hidden="true" />
              <span className="text-[13px] font-bold text-white font-mono truncate">
                {initialData.slug ? portfolioUrlLabel(initialData.slug, customDomain) : "주소 준비 중"}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${
                portfolioState === "published" ? "bg-spotify-green/10 text-spotify-green" : "bg-white/10 text-spotify-silver"
              }`}>
                {portfolioStateLabel[portfolioState]}
              </span>
              {portfolioState === "published" && publishedPath ? (
                <>
                  {!justPublished && (
                    <>
                      <Button variant="ghost" size="sm" className="h-11 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" onClick={copyPublishedLink}>
                        <Copy className="w-3 h-3" aria-hidden="true" /> 지원서용 링크 복사
                      </Button>
                      <Button variant="ghost" size="sm" className="h-11 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" onClick={() => initialData.slug && window.open(portfolioUrl(initialData.slug, customDomain), "_blank")}>
                        <ArrowUpRight className="w-3 h-3" aria-hidden="true" /> 열기
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-11 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" disabled={isSaving}>
                        공개 중지
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-spotify-dark-surface border-none rounded-lg shadow-spotify">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-[20px] font-bold text-white">
                          공개를 중지할까요?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-spotify-silver text-[15px] font-medium leading-relaxed">
                          링크가 즉시 비공개돼요. 편집한 내용은 그대로 보관되고, 언제든 다시 공개할 수 있어요.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="pt-4">
                        <AlertDialogCancel className="bg-transparent border border-white/10 text-white rounded-full h-11 font-bold px-6 hover:bg-white/5 transition-colors">
                          취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={onUnpublish}
                          className="!bg-transparent border border-spotify-negative/40 !text-spotify-negative hover:!bg-spotify-negative/10 rounded-full h-11 font-bold px-6 transition-colors"
                        >
                          공개 중지
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
                  ) : portfolioState === "draft" ? (
                <span className="text-[11px] font-medium text-spotify-silver">콘텐츠를 추가하면 공개할 수 있어요.</span>
              ) : null}
            </div>
          </div>
          {portfolioState === "published" && publishedSnapshot && (
            <p className="text-[11px] leading-relaxed text-spotify-silver">
              이 브라우저에 마지막 공개본을 저장해 두었어요.
            </p>
          )}
          {portfolioState === "published" && publishedSnapshot && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="ghost" className="mt-3 h-11 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10" disabled={isSaving}>
                  마지막 공개본으로 되돌리기
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-lg border-none bg-spotify-dark-surface shadow-spotify">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-[20px] font-bold text-white">마지막 공개본으로 되돌릴까요?</AlertDialogTitle>
                  <AlertDialogDescription className="text-[13px] leading-relaxed text-spotify-silver">
                    이 브라우저에 저장된 마지막 공개본의 콘텐츠와 디자인으로 되돌아가요. 현재 편집 내용은 바뀌지만 공개 상태는 유지돼요.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-4">
                  <AlertDialogCancel className="rounded-full border border-white/10 bg-transparent font-bold text-white hover:bg-white/5">취소</AlertDialogCancel>
                  <AlertDialogAction onClick={onRestorePublished} className="rounded-full bg-white font-bold text-black hover:bg-spotify-near-white">되돌리기</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          </div>
        </details>}
        <details className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
            세부 설정 <span className="ml-1 text-[11px] font-medium text-spotify-silver">디자인 파일 내보내기</span>
          </summary>
          <section className="mt-4" aria-labelledby="css-export-heading">
            <div className="flex items-start gap-3">
              <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-spotify-silver" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h3 id="css-export-heading" className="text-[13px] font-bold text-white">디자인 파일 내보내기</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-spotify-silver">
                  현재 포트폴리오의 색상·글꼴·간격 설정을 파일로 내려받아요. 직접 수정할 때만 사용하면 돼요.
                </p>
                <Button type="button" size="sm" variant="outline" className="mt-3 h-11 rounded-full border-white/15 bg-transparent px-4 text-[11px] font-bold text-white hover:bg-white/10" onClick={exportCss}>
                  디자인 파일 내려받기
                </Button>
              </div>
            </div>
          </section>
        </details>
        <details className="rounded-lg border border-white/5 bg-white/[0.03] p-4">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
            맞춤 주소 연결 <span className="ml-1 text-[11px] font-medium text-spotify-silver">내 도메인 사용</span>
          </summary>
          <div className="mt-4"><CustomDomainSection /></div>
        </details>
      </div>
    </div>
  );
});

export default SettingsPanel;
