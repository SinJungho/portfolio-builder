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
import { type Block, usePortfolioStore } from "@/stores/portfolioStore";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart,
  Check,
  Copy,
  Eye,
  FileDown,
  Globe,
  Grid,
  Loader2,
  Mail,
  Monitor,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Rss,
  Sparkles,
  Smartphone,
  Tablet,
  User,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import CustomDomainSection from "./components/CustomDomainSection";
import ProjectSelectionModal from "./components/ProjectSelectionModal";
import HeroEditorModal from "./components/HeroEditorModal";
import SkillsEditorModal from "./components/SkillsEditorModal";
import BlogFeedEditorModal from "./components/BlogFeedEditorModal";
import ContactEditorModal from "./components/ContactEditorModal";
import { type RawProject } from "@/types/project";
import { type PortfolioInitialData } from "@/types/portfolio";
import type { DesignTokens } from "@/schemas/portfolio";
import { buildPortfolioCss } from "@/preview/export-css";
import {
  getPortfolioState,
  portfolioStateLabel,
} from "@/lib/portfolio-state";
import { portfolioUrl, portfolioUrlLabel } from "@/lib/portfolio-url";
import { blockDisplayName, blockDescription } from "@/lib/block-labels";
import {
  type EditorDestination,
  type PortfolioReadinessGroup,
  getPortfolioReadiness,
  getPortfolioReadinessGroups,
} from "@/lib/portfolio-readiness";

import { SortableBlockItem } from "@/app/generate/[id]/steps/components/SortableBlockItem";
import DesignEditor from "@/components/features/editor/DesignEditor";
import PortfolioPreview from "@/preview/PortfolioPreview";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const blockTypeIcons: Record<string, React.ReactNode> = {
  hero: <User className="w-5 h-5 text-current" />,
  project_grid: <Grid className="w-5 h-5 text-current" />,
  skills: <BarChart className="w-5 h-5 text-current" />,
  contact: <Mail className="w-5 h-5 text-current" />,
  blog_feed: <Rss className="w-5 h-5 text-current" />,
};

type SidebarTab = "blocks" | "publish" | "design";
type PreviewViewport = "desktop" | "tablet" | "mobile";

const previewViewportOptions = [
  { id: "desktop" as const, label: "넓게", icon: Monitor, width: "1000px" },
  { id: "tablet" as const, label: "태블릿", icon: Tablet, width: "768px" },
  { id: "mobile" as const, label: "휴대폰", icon: Smartphone, width: "390px" },
];
type PreviewProject = RawProject & {
  html_url: string | null;
  ai_summary: string | null;
  ai_tags: string[];
};

export default function EditorClient({
  initialData,
}: {
  initialData: PortfolioInitialData;
}) {
  const {
    portfolioId,
    blocks,
    theme,
    designTokens,
    isSaving,
    isPublished,
    customDomain,
    initialize,
    toggleBlock,
    reorderBlocks,
    deleteBlock,
    updateBlockConfig,
    addBlock,
    setPublished,
  } = usePortfolioStore();

  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initialize({
      ...initialData,
      blocks: initialData.blocks.map((b: Block) => ({
        ...b,
        block_type: b.block_type,
      })),
    });
  }, [initialize, initialData]);

  const init = portfolioId === initialData.portfolioId;

  // React 18 비동기 렌더링 전환 훅 ( 사이드바 탭 클릭 시의 미세 렉 완화 )
  const [isPending, startTransition] = useTransition();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("publish");
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");
  const previewRef = useRef<HTMLDivElement>(null);
  const previewReviewStorageKey = `portfolio-preview-reviewed:${initialData.portfolioId}`;
  const previewSignature = JSON.stringify({ blocks, theme, designTokens });
  const [openedPreviewSignature, setOpenedPreviewSignature] = useState<string | null>(null);
  const [reviewedPreviewSignature, setReviewedPreviewSignature] = useState(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem(previewReviewStorageKey),
  );
  const previewOpened = openedPreviewSignature === previewSignature;
  const hasReviewedPreview = reviewedPreviewSignature === previewSignature;
  const focusItem = useSearchParams().get("focus");
  const handledFocusItem = useRef<string | null>(null);

  // 무거운 미리보기 스크린의 동기적 리렌더링 차단 ( 드래그 순서 변경 시 프리뷰 지연 반영 )
  const deferredBlocks = useDeferredValue(blocks);
  const deferredTheme = useDeferredValue(theme);
  const deferredDesignTokens = useDeferredValue(designTokens);

  // 대표 프로젝트 편집 관련 모달 상태 관리
  const [isEditingProjects, setIsEditingProjects] = useState<boolean>(false);
  const [isEditingHero, setIsEditingHero] = useState<boolean>(false);
  const [isEditingSkills, setIsEditingSkills] = useState<boolean>(false);
  const [isEditingBlogFeed, setIsEditingBlogFeed] = useState<boolean>(false);
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [previewHighlightedBlockId, setPreviewHighlightedBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >({});
  const [saveError, setSaveError] = useState<{ message: string; retry: () => void } | null>(null);
  const [lastBlockOrder, setLastBlockOrder] = useState<Block[] | null>(null);
  // 이번 세션에서 방금 공개했을 때만 축하 카드를 노출한다(이미 공개된 포트폴리오 재진입 시엔 조용히).
  const [justPublished, setJustPublished] = useState(false);

  const { data: rawProjects, isLoading: projectsLoading, isError: projectsLoadFailed, refetch: refetchProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: init,
  });

  const previewBlocks = React.useMemo(() => {
    if (!rawProjects) return deferredBlocks;

    const projectsById = new Map<string, PreviewProject>(
      rawProjects.map((project) => [project.id, {
        ...project,
        html_url: project.html_url ?? null,
        ai_summary: project.ai_summary ?? null,
        ai_tags: project.ai_tags ?? [],
      }]),
    );

    return deferredBlocks.map((block) => {
      if (block.block_type !== "project_grid") return block;

      const projectIds = Array.isArray(block.config.project_ids)
        ? block.config.project_ids.filter(
            (projectId): projectId is string => typeof projectId === "string",
          )
        : [];

      return {
        ...block,
        config: {
          ...block.config,
          projectsData: projectIds
            .map((projectId) => projectsById.get(projectId))
            .filter((project): project is PreviewProject => project !== undefined),
        },
      };
    });
  }, [deferredBlocks, rawProjects]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b: Block) => b.id === active.id);
      const newIndex = blocks.findIndex((b: Block) => b.id === over.id);
      setLastBlockOrder(blocks.map((block: Block) => ({ ...block, config: { ...block.config } })));
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      newBlocks.forEach((b: Block, i: number) => (b.position = i));
      void reorderBlocks(newBlocks).catch(() => {
        toast.error("섹션 순서를 저장하지 못했어요. 이전 순서로 돌아갔어요.");
      });
    }
  };

  const undoBlockOrder = () => {
    if (!lastBlockOrder) return;
    const restored = lastBlockOrder.map((block, index) => ({ ...block, config: { ...block.config }, position: index }));
    void reorderBlocks(restored)
      .then(() => setLastBlockOrder(null))
      .catch(() => toast.error("섹션 순서를 되돌리지 못했어요. 잠시 후 다시 시도해주세요."));
  };

  const contactBlock = blocks.find((b: Block) => b.block_type === "contact");
  const portfolioState = getPortfolioState(isPublished, blocks.length);
  const readinessItems = getPortfolioReadiness(
    blocks,
    rawProjects?.map((project) => project.id) ?? [],
  );
  const readinessGroups = getPortfolioReadinessGroups(readinessItems);

  const handleTabChange = (tab: SidebarTab) => {
    startTransition(() => {
      setSidebarTab(tab);
    });
  };

  const handleTabKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    tab: SidebarTab,
  ) => {
    const tabs: SidebarTab[] = ["publish", "blocks", "design"];
    const currentIndex = tabs.indexOf(tab);
    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : event.key === "ArrowRight"
          ? (currentIndex + 1) % tabs.length
          : event.key === "ArrowLeft"
            ? (currentIndex - 1 + tabs.length) % tabs.length
            : null;

    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = tabs[nextIndex];
    handleTabChange(nextTab);
    document.getElementById(`editor-tab-${nextTab}`)?.focus();
  };

  const openPreview = () => {
    setOpenedPreviewSignature(previewSignature);
    setIsPreviewing(true);
    requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      previewRef.current?.focus({ preventScroll: true });
    });
  };

  const confirmPreviewReview = () => {
    sessionStorage.setItem(previewReviewStorageKey, previewSignature);
    setReviewedPreviewSignature(previewSignature);
  };

  const handlePublish = async () => {
    setSaveError(null);
    const nextGroup = readinessGroups.find((group) => !group.complete);
    if (nextGroup) {
      toast.error(`${nextGroup.label}을(를) 먼저 준비해주세요.`);
      handleReadinessAction(nextGroup.destination);
      return;
    }

    if (!hasReviewedPreview) {
      handleTabChange("publish");
      toast.error("미리보기를 확인한 뒤 공개해 주세요.");
      return;
    }

    try {
      await setPublished(true);
      setJustPublished(true);
      toast.success("공개했어요. 이제 링크를 복사해 지원서에 넣어보세요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "공개하지 못했어요.";
      setSaveError({ message, retry: handlePublish });
      toast.error(message);
    }
  };

  const handleUnpublish = async () => {
    setSaveError(null);
    try {
      await setPublished(false);
      setJustPublished(false);
      toast.success("공개를 중지했어요. 편집 내용은 그대로 보관돼요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "공개를 중지하지 못했어요.";
      setSaveError({ message, retry: handleUnpublish });
      toast.error(message);
    }
  };

  const handleReadinessAction = async (destination: EditorDestination) => {
    try {
      if (destination === "projects") {
        const projectBlock = blocks.find(
          (block: Block) => block.block_type === "project_grid",
        );
        if (projectBlock) {
          if (!projectBlock.is_visible) await toggleBlock(projectBlock.id);
          setIsPreviewing(false);
          openProjectEditor(projectBlock);
        } else {
          const newProjectBlock = await addBlock("project_grid");
          if (newProjectBlock) {
            setIsPreviewing(false);
            openProjectEditor(newProjectBlock);
          }
        }
        return;
      }

      if (destination === "contact") {
        if (contactBlock) {
          if (!contactBlock.is_visible) await toggleBlock(contactBlock.id);
          setIsPreviewing(false);
          openProjectEditor(contactBlock);
        } else {
          const newContactBlock = await addBlock("contact");
          if (newContactBlock) {
            setIsPreviewing(false);
            openProjectEditor(newContactBlock);
          }
        }
        return;
      }

      const heroBlock = blocks.find((block: Block) => block.block_type === "hero");
      if (heroBlock) {
        if (!heroBlock.is_visible) await toggleBlock(heroBlock.id);
        setIsPreviewing(false);
        openProjectEditor(heroBlock);
      } else {
        const newHeroBlock = await addBlock("hero");
        if (newHeroBlock) {
          setIsPreviewing(false);
          openProjectEditor(newHeroBlock);
        }
      }
    } catch {
      toast.error("변경사항을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  const openProjectEditor = (block: Block) => {
    setPreviewHighlightedBlockId(block.id);
    setEditingBlockId(block.id);
    if (block.block_type === "project_grid") {
      setTempSelectedIds((block.config.project_ids as string[]) || []);
      setTempCustomDescriptions(
        (block.config.custom_descriptions as Record<string, string>) || {},
      );
      setIsEditingProjects(true);
    } else if (block.block_type === "hero") {
      setIsEditingHero(true);
    } else if (block.block_type === "skills") {
      setIsEditingSkills(true);
    } else if (block.block_type === "blog_feed") {
      setIsEditingBlogFeed(true);
    } else if (block.block_type === "contact") {
      setIsEditingContact(true);
    }
  };

  const handlePreviewBlockSelect = (block: Block) => {
    setPreviewHighlightedBlockId(block.id);
    setIsInspectorOpen(true);
    setIsPreviewing(false);
    openProjectEditor(block);
  };

  useEffect(() => {
    if (!focusItem || handledFocusItem.current === focusItem) return;
    // 애널리틱스에서 오는 blocks/publish 딥링크는 해당 사이드바 탭으로 전환한다.
    if (focusItem === "blocks" || focusItem === "publish") {
      handledFocusItem.current = focusItem;
      handleTabChange(focusItem);
      return;
    }
    if (!["hero", "projects", "contact"].includes(focusItem)) return;
    handledFocusItem.current = focusItem;
    void handleReadinessAction(focusItem as EditorDestination);
    // The action must run once per URL focus target; the ref prevents reruns as blocks change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusItem]);

  const handleSaveProjects = (
    selectedIds: string[],
    customDescriptions: Record<string, string>,
  ) => {
    if (!editingBlockId) return;
    const block = blocks.find((b: Block) => b.id === editingBlockId);
    if (block) {
      updateBlockConfig(editingBlockId, {
        ...block.config,
        project_ids: selectedIds,
        custom_descriptions: customDescriptions,
      }).then(() => {
        setIsEditingProjects(false);
        setEditingBlockId(null);
        setSaveError(null);
        toast.success("대표 프로젝트 설정을 업데이트했어요.");
      }).catch(() => {
        setSaveError({
          message: "대표 프로젝트 설정을 저장하지 못했어요. 입력 내용은 유지돼요.",
          retry: () => handleSaveProjects(selectedIds, customDescriptions),
        });
        toast.error("대표 프로젝트 설정을 저장하지 못했어요. 입력 내용은 유지돼요.");
      });
    }
  };

  const handleSaveBlockConfig = (config: Record<string, unknown>) => {
    if (!editingBlockId) return;
    updateBlockConfig(editingBlockId, config).then(() => {
      setIsEditingHero(false);
      setIsEditingSkills(false);
      setIsEditingBlogFeed(false);
      setIsEditingContact(false);
      setEditingBlockId(null);
      setSaveError(null);
      toast.success("섹션 설정을 업데이트했어요.");
    }).catch(() => {
      setSaveError({
        message: "섹션 설정을 저장하지 못했어요. 입력 내용은 유지돼요.",
        retry: () => handleSaveBlockConfig(config),
      });
      toast.error("섹션 설정을 저장하지 못했어요. 입력 내용은 유지돼요.");
    });
  };

  if (!init) {
    return (
      <div className="flex justify-center p-12 h-screen items-center bg-spotify-near-black">
        <Loader2 className="animate-spin w-8 h-8 text-spotify-green" />
      </div>
    );
  }

  const previewWidth = previewViewportOptions.find((option) => option.id === previewViewport)?.width || "1000px";

  return (
    <div className="flex flex-col h-screen w-full md:-ml-64 md:w-[calc(100%+16rem)] bg-spotify-near-black overflow-hidden text-white">
      {/* 상단 헤더 영역 */}
      <header className="h-14 border-b border-white/5 bg-spotify-near-black flex items-center justify-between px-6 shrink-0 z-20">
        <h1 className="sr-only">포트폴리오 편집</h1>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-[14px] font-bold text-spotify-silver hover:text-white transition-colors"
          aria-label="대시보드로 돌아가기"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">대시보드로 돌아가기</span>
        </Link>
          <div className="flex items-center gap-4">
          {lastBlockOrder && <button type="button" onClick={undoBlockOrder} disabled={isSaving} className="text-[12px] font-bold text-spotify-green hover:text-white disabled:opacity-50">순서 되돌리기</button>}
          <button
            type="button"
            onClick={() => setIsPreviewing((previewing) => !previewing)}
            className="md:hidden text-[12px] font-bold text-spotify-near-white hover:text-white"
          >
            {isPreviewing ? "편집" : "미리보기"}
          </button>
          <button
            type="button"
            onClick={() => setIsInspectorOpen((open) => !open)}
            className="hidden md:inline-flex items-center gap-1.5 text-[12px] font-bold text-spotify-near-white hover:text-white"
            aria-pressed={isInspectorOpen}
          >
            {isInspectorOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            {isInspectorOpen ? "컨트롤 숨기기" : "컨트롤 열기"}
          </button>
          <div className="flex items-center gap-1.5 text-[12px] font-bold transition-all">
            {isSaving ? (
              <span className="text-spotify-green flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> <span className="hidden sm:inline">자동 저장 중...</span><span className="sr-only">자동 저장 중</span>
              </span>
            ) : (
              <span className="text-spotify-silver flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-spotify-green" /> <span className="hidden sm:inline">모든 변경사항 자동 저장됨</span><span className="sr-only">모든 변경사항 자동 저장됨</span>
              </span>
            )}
          </div>
        </div>
      </header>
      {saveError && (
        <div role="alert" className="flex items-center justify-between gap-3 border-b border-spotify-negative/30 bg-spotify-negative/10 px-6 py-3 text-[13px] font-bold text-spotify-negative">
          <span>{saveError.message}</span>
          <Button size="sm" variant="outline" className="border-spotify-negative/40 bg-transparent text-spotify-negative hover:bg-spotify-negative/10" onClick={saveError.retry}>다시 시도</Button>
        </div>
      )}

      {/* 에디터 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 좌측 사이드바 패널 */}
        <aside className={`${isPreviewing ? "fixed inset-x-0 bottom-0 z-30 flex max-h-[72vh] rounded-t-3xl border-t border-white/10" : "flex"} ${isInspectorOpen ? "md:flex" : "md:hidden"} w-full md:static md:max-h-none md:w-[340px] md:rounded-none lg:w-[380px] shrink-0 border-r border-white/5 bg-spotify-dark-surface flex-col shadow-spotify`}>
          {isPreviewing && (
            <div className="flex items-center justify-between border-b border-white/5 px-5 py-3 md:hidden">
              <p className="text-[12px] font-bold text-white">미리보기를 보며 바로 수정해요</p>
              <button
                type="button"
                onClick={() => setIsPreviewing(false)}
                className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
              >
                전체 편집
              </button>
            </div>
          )}
          <div role="tablist" aria-label="포트폴리오 편집 단계" className="flex p-3 gap-2 bg-spotify-near-black border-b border-white/5 shrink-0">
            <button
              id="editor-tab-publish"
              onClick={() => handleTabChange("publish")}
              onKeyDown={(event) => handleTabKeyDown(event, "publish")}
              className={`flex-1 cursor-pointer rounded-full py-2.5 text-[13px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${
                sidebarTab === "publish"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
              type="button"
              role="tab"
              aria-selected={sidebarTab === "publish"}
              aria-controls="editor-panel"
              tabIndex={sidebarTab === "publish" ? 0 : -1}
            >
              공개 준비
            </button>
            <button
              id="editor-tab-blocks"
              onClick={() => handleTabChange("blocks")}
              onKeyDown={(event) => handleTabKeyDown(event, "blocks")}
              className={`flex-1 cursor-pointer rounded-full py-2.5 text-[13px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${
                sidebarTab === "blocks"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
              type="button"
              role="tab"
              aria-selected={sidebarTab === "blocks"}
              aria-controls="editor-panel"
              tabIndex={sidebarTab === "blocks" ? 0 : -1}
            >
              섹션 구성
            </button>
            <button
              id="editor-tab-design"
              onClick={() => handleTabChange("design")}
              onKeyDown={(event) => handleTabKeyDown(event, "design")}
              className={`flex-1 cursor-pointer rounded-full py-2.5 text-[13px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${
                sidebarTab === "design"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
              type="button"
              role="tab"
              aria-selected={sidebarTab === "design"}
              aria-controls="editor-panel"
              tabIndex={sidebarTab === "design" ? 0 : -1}
            >
              디자인
            </button>
          </div>
          <div role="tabpanel" id="editor-panel" aria-labelledby={`editor-tab-${sidebarTab}`} className="flex-1 overflow-y-auto p-5 md:p-6 bg-spotify-dark-surface">
            {isPending ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin w-6 h-6 text-spotify-green" />
              </div>
            ) : sidebarTab === "blocks" ? (
              <BlocksPanel
                blocks={blocks}
                sensors={sensors}
                handleDragEnd={handleDragEnd}
                toggleBlock={toggleBlock}
                deleteBlock={deleteBlock}
                openProjectEditor={openProjectEditor}
                highlightPreviewBlock={setPreviewHighlightedBlockId}
                isSaving={isSaving}
                addBlock={addBlock}
              />
            ) : sidebarTab === "publish" ? (
              <SettingsPanel
                initialData={initialData}
                theme={theme}
                designTokens={designTokens as DesignTokens}
                customDomain={customDomain}
                portfolioState={portfolioState}
                isSaving={isSaving}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                readinessGroups={readinessGroups}
                projectsLoading={projectsLoading}
                onReadinessAction={handleReadinessAction}
                onPreview={openPreview}
                previewOpened={previewOpened}
                hasReviewedPreview={hasReviewedPreview}
                hasReviewedOnce={reviewedPreviewSignature !== null}
                onReviewPreview={confirmPreviewReview}
                justPublished={justPublished}
              />
            ) : (
              <DesignPanel />
            )}
          </div>
        </aside>

        {/* 우측 실시간 미리보기 스크린 */}
        <main className={`${isPreviewing ? "flex" : "hidden"} md:flex flex-1 flex-col bg-spotify-near-black overflow-y-auto relative items-center pt-4 md:pt-8 pb-20 md:pb-32`}>
          <MobilePreviewStatus
            portfolioState={portfolioState}
            readinessGroups={readinessGroups}
            projectsLoading={projectsLoading}
            hasReviewedPreview={hasReviewedPreview}
            onAction={handleReadinessAction}
            onReturnToPublish={() => {
              setIsPreviewing(false);
              handleTabChange("publish");
            }}
          />
          {projectsLoadFailed && (
            <div role="alert" className="mb-3 flex w-[calc(100%-3rem)] max-w-[1000px] items-center justify-between gap-3 rounded-2xl border border-spotify-negative/30 bg-spotify-negative/10 px-4 py-3 text-[12px] font-bold text-spotify-negative">
              <span>GitHub 프로젝트를 불러오지 못했어요. 대표 작업이 비어 보일 수 있어요.</span>
              <Button type="button" size="sm" variant="outline" className="h-8 shrink-0 rounded-full border-spotify-negative/40 bg-transparent px-3 text-[11px] text-spotify-negative hover:bg-spotify-negative/10" onClick={() => void refetchProjects()}>
                다시 불러오기
              </Button>
            </div>
          )}
          <div ref={previewRef} tabIndex={-1} aria-label="포트폴리오 미리보기" style={{ width: `min(${previewWidth}, calc(100% - 3rem))`, maxWidth: previewWidth }} className="w-[calc(100%-3rem)] bg-spotify-dark-surface rounded-t-2xl md:rounded-2xl overflow-hidden shadow-spotify mx-6 relative animate-in fade-in slide-in-from-bottom-8 duration-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
          <div className="min-h-10 bg-spotify-near-black border-b border-white/5 flex flex-wrap items-center justify-between gap-2 px-4 py-2 shrink-0">
            <span className="text-[11px] font-bold text-spotify-silver">{isPublished ? "공개됨" : "초안 미리보기"}</span>
            <div className="min-w-0 max-w-full flex items-center gap-2">
              {!isInspectorOpen && (
                <button
                  type="button"
                  onClick={() => setIsInspectorOpen(true)}
                  className="hidden md:inline-flex h-7 items-center gap-1 rounded-full bg-white/10 px-2 text-[10px] font-bold text-white hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green"
                >
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
                    onClick={() => setPreviewViewport(id)}
                    className={`flex h-7 items-center gap-1 rounded-full px-2 text-[10px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${previewViewport === id ? "bg-white text-black" : "text-spotify-silver hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden lg:inline">{label}</span>
                  </button>
                ))}
              </div>
            <div className="min-w-0 max-w-full bg-spotify-mid-dark border border-white/5 rounded-full px-4 py-1 text-[11px] text-spotify-silver font-mono flex items-center gap-2 shadow-inner">
              <Globe className="w-3.5 h-3.5 text-spotify-silver/50" />
              <span className="min-w-0 truncate">
                {initialData.slug ? portfolioUrlLabel(initialData.slug, customDomain) : "주소 준비 중"}
              </span>
            </div>
            </div>
          </div>

            {/* 실시간으로 연동되는 뷰포트 영역 (Deferred Value를 통해 인풋 타이핑 반응성 보존) */}
            <div className="w-full h-full min-h-[800px] overflow-hidden bg-white">
              <PortfolioPreview
                blocks={previewBlocks}
                theme={deferredTheme}
                designTokens={deferredDesignTokens}
                // slug 미전달 — PDF 내보내기 버튼은 position:fixed라 에디터 프레임을 뚫고 뷰포트에 고정됨.
                // 내보내기는 게시 페이지 전용 액션이므로 에디터 프리뷰에선 렌더하지 않음.
                slug={undefined}
                portfolioId={initialData?.portfolioId}
                highlightedBlockId={previewHighlightedBlockId}
                previewViewport={previewViewport}
                onSelectBlock={handlePreviewBlockSelect}
              />
            </div>
          </div>
        </main>
      </div>

      {/* 격리 설계된 고성능 리포지토리 지정 팝업 모달 */}
      <ProjectSelectionModal
        isOpen={isEditingProjects}
        onClose={() => {
          setIsEditingProjects(false);
          setEditingBlockId(null);
        }}
        onSave={handleSaveProjects}
        initialSelectedIds={tempSelectedIds}
        initialCustomDescriptions={tempCustomDescriptions}
        rawProjects={rawProjects || []}
        isSaving={isSaving}
      />

      <HeroEditorModal
        key={`hero-editor-${editingBlockId ?? "new"}`}
        isOpen={isEditingHero}
        onClose={() => {
          setIsEditingHero(false);
          setEditingBlockId(null);
        }}
        onSave={handleSaveBlockConfig}
        initialConfig={blocks.find((b: Block) => b.id === editingBlockId)?.config || {}}
        isSaving={isSaving}
      />

      <SkillsEditorModal
        key={`skills-editor-${editingBlockId ?? "new"}`}
        isOpen={isEditingSkills}
        onClose={() => {
          setIsEditingSkills(false);
          setEditingBlockId(null);
        }}
        onSave={handleSaveBlockConfig}
        initialConfig={blocks.find((b: Block) => b.id === editingBlockId)?.config || {}}
        isSaving={isSaving}
      />

      <BlogFeedEditorModal
        key={`blog-editor-${editingBlockId ?? "new"}`}
        isOpen={isEditingBlogFeed}
        onClose={() => {
          setIsEditingBlogFeed(false);
          setEditingBlockId(null);
        }}
        onSave={handleSaveBlockConfig}
        initialConfig={blocks.find((b: Block) => b.id === editingBlockId)?.config || {}}
        isSaving={isSaving}
      />

      <ContactEditorModal
        key={`contact-editor-${editingBlockId ?? "new"}`}
        isOpen={isEditingContact}
        onClose={() => {
          setIsEditingContact(false);
          setEditingBlockId(null);
        }}
        onSave={handleSaveBlockConfig}
        initialConfig={blocks.find((b: Block) => b.id === editingBlockId)?.config || {}}
        isSaving={isSaving}
      />
    </div>
  );
}

// ==========================================
// 캡슐화 및 메모이제이션 처리된 하위 패널 컴포넌트군
// ==========================================

interface BlocksPanelProps {
  blocks: Block[];
  sensors: ReturnType<typeof useSensors>;
  handleDragEnd: (event: DragEndEvent) => void;
  toggleBlock: (id: string) => Promise<void>;
  deleteBlock: (id: string) => Promise<void>;
  openProjectEditor: (block: Block) => void;
  highlightPreviewBlock: (id: string) => void;
  isSaving: boolean;
  addBlock: (blockType: string) => Promise<Block | undefined>;
}

const BlocksPanel = React.memo(function BlocksPanel({
  blocks,
  sensors,
  handleDragEnd,
  toggleBlock,
  deleteBlock,
  openProjectEditor,
  highlightPreviewBlock,
  isSaving,
  addBlock,
}: BlocksPanelProps) {
  const handleToggle = async (blockId: string) => {
    try {
      await toggleBlock(blockId);
    } catch {
      toast.error("공개 상태를 저장하지 못했어요. 이전 상태로 돌아갔어요.");
    }
  };

  const handleDelete = async (blockId: string) => {
    try {
      await deleteBlock(blockId);
      toast.success("섹션을 삭제했어요.");
    } catch {
      toast.error("섹션을 삭제하지 못했어요. 섹션은 그대로 보관돼요.");
    }
  };

  const handleAdd = async (blockType: string) => {
    try {
      await addBlock(blockType);
    } catch {
      toast.error("새 섹션을 추가하지 못했어요. 잠시 후 다시 시도해 주세요.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
          섹션 순서 및 표시 설정
        </h2>
      </div>
      <p className="px-1 text-[12px] font-medium leading-relaxed text-spotify-silver">
        순서 변경 아이콘을 선택한 뒤 스페이스바와 방향키로도 섹션 순서를 바꿀 수 있어요.
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b: Block) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {blocks.map((block: Block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                icon={
                  blockTypeIcons[block.block_type] || (
                    <Grid className="w-5 h-5" />
                  )
                }
                onToggle={handleToggle}
                onDelete={handleDelete}
                onOpenProjectEditor={openProjectEditor}
                onFocusBlock={highlightPreviewBlock}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 bg-spotify-near-black/20 rounded-2xl gap-3">
          <div className="p-3 bg-white/5 rounded-full text-spotify-silver">
            <Grid className="w-6 h-6" />
          </div>
          <p className="text-spotify-silver font-bold text-[14px]">
            아직 추가된 섹션이 없어요.
          </p>
          <p className="max-w-[240px] text-center text-[12px] leading-relaxed text-spotify-silver">
            빠르게 시작하려면 소개, 대표 작업, 연락처 세 가지만 추가하면 돼요.
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-white/5 mt-6">
        <div className="flex flex-col gap-1 mb-4 px-1">
          <h3 className="text-[15px] font-bold text-white">새 섹션 추가</h3>
          <p className="text-[12px] text-spotify-silver font-medium">
            내 포트폴리오를 더 풍성하게 만들어보세요.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(blockDisplayName).map((type: string) => {
            const isUnique = type === "hero" || type === "contact";
            const alreadyExists =
              isUnique && blocks.some((b: Block) => b.block_type === type);

            return (
              <button
                key={type}
                onClick={() => void handleAdd(type)}
                disabled={isSaving || alreadyExists}
                className={`
                  flex flex-col items-start gap-1 px-3 py-3 rounded-xl text-left transition-all border cursor-pointer
                  ${
                    alreadyExists
                      ? "bg-spotify-near-black border-white/5 text-spotify-silver/50 cursor-not-allowed"
                      : "bg-spotify-near-black border-white/5 text-white hover:border-spotify-green hover:bg-spotify-mid-dark active:scale-95 group"
                  }
                `}
                type="button"
              >
                <span className={`flex items-center gap-2 text-[12px] font-bold ${alreadyExists ? "" : "group-hover:text-spotify-green"}`}>
                  {alreadyExists ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  {blockDisplayName[type]}
                </span>
                <span className={`text-[11px] font-medium leading-snug ${alreadyExists ? "text-spotify-silver/50" : "text-spotify-silver"}`}>
                  {alreadyExists ? "이미 추가됨" : blockDescription[type]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

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
  onReadinessAction: (destination: EditorDestination) => void;
  onPreview: () => void;
  previewOpened: boolean;
  hasReviewedPreview: boolean;
  hasReviewedOnce: boolean;
  onReviewPreview: () => void;
  justPublished: boolean;
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
  onReadinessAction,
  onPreview,
  previewOpened,
  hasReviewedPreview,
  hasReviewedOnce,
  onReviewPreview,
  justPublished,
}: SettingsPanelProps) {
  const publishedPath = initialData.slug
    ? portfolioUrl(initialData.slug, customDomain)
    : null;
  const nextGroup = readinessGroups.find((group) => !group.complete);

  // 미리보기 확인까지 포함해 화면의 진행도와 실제 공개 조건을 같은 숫자로 보여준다.
  const totalSteps = readinessGroups.length + 1;
  const completedSteps = readinessGroups.filter((group) => group.complete).length + (hasReviewedPreview ? 1 : 0);
  const progressPct = Math.round((completedSteps / totalSteps) * 100);
  const previewIsNext = !nextGroup && !hasReviewedPreview;
  const readyToPublish = !nextGroup && hasReviewedPreview;
  // 한 번 확인한 뒤 내용을 바꿔 미리보기가 다시 잠긴 상태. 공개 버튼이 조용히 사라지는 대신
  // "왜 또 잠겼는지"를 카피로 설명해 마감 직전 불안(다 됐는데 왜?)을 줄인다.
  const previewStale = previewIsNext && hasReviewedOnce;
  const readinessLead =
    projectsLoading
      ? "GitHub 프로젝트를 확인하고 있어요. 확인이 끝나면 대표 작업 준비 상태를 정확히 보여드릴게요."
      : portfolioState === "published"
      ? "공개 중이에요. 필요한 준비를 모두 마쳤어요."
      : completedSteps === 0
        ? "GitHub에서 불러온 내용으로 시작해요. 아래를 채우면 지원서에 넣을 링크가 완성돼요."
        : readyToPublish
          ? "준비가 끝났어요. 링크를 만들어 지원서에 넣어보세요."
          : previewStale
            ? "내용을 바꿨네요. 바뀐 모습으로 미리보기만 한 번 더 확인하면 바로 공개할 수 있어요."
            : previewIsNext
              ? "마지막으로 미리보기만 확인하면 공개할 수 있어요."
        : totalSteps - completedSteps === 1
              ? "거의 다 왔어요. 한 가지만 더 채우면 공개할 수 있어요."
              : "좋아요, 순조롭게 채워지고 있어요. 남은 항목을 이어가 볼까요?";

  const copyPublishedLink = async () => {
    if (!initialData.slug) return;
    try {
      await navigator.clipboard.writeText(portfolioUrl(initialData.slug, customDomain));
      toast.success("지원서용 링크를 복사했어요.");
    } catch {
      toast.error("링크를 복사하지 못했어요. 위 주소를 직접 선택해 복사해주세요.");
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
    toast.success("전문가용 CSS를 내려받았어요.");
  };

  return (
    <div className="space-y-6">
      {justPublished && portfolioState === "published" && (
        <div className="rounded-3xl border border-spotify-green/30 bg-spotify-green/[0.07] p-6 shadow-spotify text-white space-y-5 animate-in fade-in zoom-in-95 duration-500 motion-reduce:animate-none">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-spotify-green text-black">
              <Check className="h-6 w-6" strokeWidth={3} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="text-[17px] font-bold tracking-tight text-white">공개됐어요 🎉</h2>
              <p className="text-[12px] font-medium text-spotify-silver">이제 이 링크만 지원서에 붙여넣으면 끝이에요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/30 px-3 py-2.5">
            <Globe className="w-4 h-4 shrink-0 text-spotify-green" />
            <span className="truncate font-mono text-[13px] font-bold text-white">
              {initialData.slug ? portfolioUrlLabel(initialData.slug, customDomain) : "주소 준비 중"}
            </span>
          </div>
          <div className="flex gap-2">
            <Button type="button" className="btn-pill-primary h-11 flex-1 text-[13px]" onClick={copyPublishedLink}>
              <Copy className="w-4 h-4" /> 지원서용 링크 복사
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="h-11 rounded-full bg-white/10 px-4 text-[13px] font-bold text-white hover:bg-white/15"
              onClick={() => initialData.slug && window.open(portfolioUrl(initialData.slug, customDomain), "_blank")}
            >
              <ArrowUpRight className="w-4 h-4" /> 열기
            </Button>
          </div>
        </div>
      )}
      {portfolioState !== "published" && completedSteps > 0 && (
        // 첫 진입의 감정 프레임: 빈 체크리스트가 아니라 "GitHub가 이미 채워둔 것"을 먼저 보여준다.
        // completedSteps === 0(진짜 빈 상태)에서는 근거 없는 안심이 되므로 숨긴다(정직한 증거 원칙).
        <div className="rounded-3xl border border-spotify-green/20 bg-spotify-green/[0.06] p-5 text-white flex items-start gap-3.5 animate-in fade-in duration-500 motion-reduce:animate-none">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-spotify-green/15 text-spotify-green">
            <Sparkles className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
          <div className="min-w-0 space-y-1">
            <p className="text-[15px] font-bold tracking-tight text-white">이미 대부분 채워져 있어요</p>
            <p className="text-[12px] text-spotify-silver font-medium leading-relaxed">
              {totalSteps - completedSteps > 0
                ? `GitHub에서 불러온 내용으로 ${completedSteps}단계를 채웠어요. ${totalSteps - completedSteps}단계만 확인하면 지원서에 넣을 링크가 완성돼요.`
                : "GitHub에서 불러온 내용으로 준비를 마쳤어요. 미리보기만 확인하면 공개할 수 있어요."}
            </p>
          </div>
        </div>
      )}
      <div className="bg-spotify-dark-surface border border-white/5 rounded-3xl p-6 shadow-spotify text-white space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[16px] font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-spotify-green" />
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

        <ul className="-mx-2 space-y-0.5" aria-label="공개 전 확인 항목">
          {readinessGroups.map((group) => {
            const isProjectPending = projectsLoading && group.id === "projects";
            const isNext = !isProjectPending && !group.complete && group.id === nextGroup?.id;
            const missingLabels = group.missingItems.map((item) => item.label).join(" · ");
            return (
              <li
                key={group.id}
                className={`rounded-xl px-2 py-2.5 text-[12px] transition-colors ${isNext ? "bg-white/[0.06]" : ""}`}
              >
                <div className="flex items-center gap-3 font-bold">
                  {group.complete ? (
                    <Check className="h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" />
                  ) : (
                    <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${isNext ? "border-spotify-green" : "border-white/25"}`} aria-hidden="true" />
                  )}
                  <span className={group.complete || isNext ? "text-white" : "text-spotify-silver"}>{group.label}</span>
                  {group.complete ? (
                    <span className="ml-auto text-[11px] font-medium text-spotify-silver">완료</span>
                  ) : isProjectPending ? (
                    <span className="ml-auto text-[11px] font-medium text-spotify-silver">확인 중</span>
                  ) : isNext ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-8 rounded-full bg-white/10 px-3 text-[11px] font-bold text-white hover:bg-white/15"
                      onClick={() => onReadinessAction(group.destination)}
                    >
                      {group.action}
                    </Button>
                  ) : (
                    <span className="ml-auto text-[11px] font-medium text-spotify-silver">다음 단계 후</span>
                  )}
                </div>
                <p className={`ml-7 mt-1 leading-relaxed ${isNext ? "text-spotify-silver" : "text-spotify-silver/80"}`}>
                  {isProjectPending
                    ? "GitHub 프로젝트 상태를 확인하고 있어요."
                    : isNext && missingLabels
                    ? `${group.description} · 남은 항목: ${missingLabels}`
                    : isNext
                      ? group.description
                      : !group.complete && nextGroup
                        ? `${group.description} · ${nextGroup.label}을(를) 먼저 완료해주세요.`
                        : group.description}
                </p>
              </li>
            );
          })}
          <li className={`flex items-center gap-3 rounded-xl px-2 py-2 text-[12px] font-bold transition-colors ${previewIsNext ? "bg-white/[0.06]" : ""}`}>
            {hasReviewedPreview ? (
              <Check className="h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" />
            ) : (
              <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${previewIsNext ? "border-spotify-green" : "border-white/25"}`} aria-hidden="true" />
            )}
            <span className={hasReviewedPreview ? "text-white" : previewIsNext ? "text-white" : "text-spotify-silver"}>미리보기 확인</span>
            {hasReviewedPreview ? (
              <span className="ml-auto text-[11px] font-medium text-spotify-silver">완료</span>
            ) : previewIsNext ? (
              // 미리보기 확인 단계는 현재 필요한 행동 하나만 노출한다.
              <Button type="button" variant="ghost" size="sm" className="ml-auto h-8 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={previewOpened ? onReviewPreview : onPreview}>
                {previewOpened ? <Check className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                {previewOpened ? "확인했어요" : "미리보기 확인하기"}
              </Button>
            ) : (
              <span className="ml-auto text-[11px] font-medium text-spotify-silver">나중에</span>
            )}
          </li>
        </ul>

        {readyToPublish && portfolioState !== "published" && (
          <div className="space-y-3 border-t border-white/5 pt-5">
            <p className="text-[13px] font-bold leading-relaxed text-white">
              준비가 끝났어요. 이제 지원서에 넣을 링크를 만들 차례예요.
            </p>
            <Button
              type="button"
              className="btn-pill-primary h-12 w-full text-[14px]"
              disabled={isSaving}
              onClick={onPublish}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Globe className="w-4 h-4" aria-hidden="true" />
              )}
              포트폴리오 공개하기
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-[10px] font-bold text-spotify-silver tracking-wider">
            기본 주소
          </Label>
          <div className="flex flex-col gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-spotify-green shrink-0" />
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
                  {/* 방금 공개한 직후엔 위 성공 카드가 복사/열기를 제공하므로 여기선 중복을 접고 공개 중지만 남긴다. */}
                  {!justPublished && (
                    <>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" onClick={copyPublishedLink}>
                        <Copy className="w-3 h-3" /> 지원서용 링크 복사
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" onClick={() => initialData.slug && window.open(portfolioUrl(initialData.slug, customDomain), "_blank")}>
                        <ArrowUpRight className="w-3 h-3" /> 열기
                      </Button>
                    </>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" disabled={isSaving}>
                        공개 중지
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-spotify-dark-surface border-none rounded-3xl shadow-spotify">
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
                <span className="text-[11px] font-medium text-spotify-silver">섹션을 추가하면 공개할 수 있어요.</span>
              ) : null}
            </div>
          </div>
          {portfolioState === "published" && (
            <p className="text-[11px] leading-relaxed text-spotify-silver">
              변경사항은 공개 페이지에 자동 반영되며, 언제든 공개를 중지할 수 있어요.
            </p>
          )}
        </div>
        <details className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
            고급 설정 <span className="ml-1 text-[11px] font-medium text-spotify-silver">CSS 파일 내보내기</span>
          </summary>
          <section className="mt-4" aria-labelledby="css-export-heading">
            <div className="flex items-start gap-3">
              <FileDown className="mt-0.5 h-4 w-4 shrink-0 text-spotify-silver" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <h3 id="css-export-heading" className="text-[13px] font-bold text-white">전문가용 CSS 내보내기</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-spotify-silver">
                  현재 포트폴리오 분위기를 CSS 파일로 내려받아요. 색상·글꼴·간격을 직접 수정할 때만 사용하면 돼요. 직접 수정한 기존 CSS가 있다면 파일에 함께 포함됩니다.
                </p>
                <Button type="button" size="sm" variant="outline" className="mt-3 h-9 rounded-full border-white/15 bg-transparent px-4 text-[11px] font-bold text-white hover:bg-white/10" onClick={exportCss}>
                  CSS 파일 내려받기
                </Button>
              </div>
            </div>
          </section>
        </details>
        <details className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
          <summary className="cursor-pointer list-none text-[13px] font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
            맞춤 주소 연결 <span className="ml-1 text-[11px] font-medium text-spotify-silver">내 도메인 사용</span>
          </summary>
          <div className="mt-4"><CustomDomainSection /></div>
        </details>
      </div>
    </div>
  );
});

function DesignPanel() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-[17px] font-bold tracking-tight text-white">디자인</h2>
        <p className="mt-1 text-[12px] font-medium text-spotify-silver">추천 분위기를 고른 뒤 필요할 때만 세부 설정을 조정해요.</p>
      </div>
      <DesignEditor />
    </div>
  );
}

function MobilePreviewStatus({
  portfolioState,
  readinessGroups,
  projectsLoading,
  hasReviewedPreview,
  onAction,
  onReturnToPublish,
}: Pick<SettingsPanelProps, "portfolioState" | "readinessGroups" | "hasReviewedPreview" | "projectsLoading"> & {
  onAction: (destination: EditorDestination) => void;
  onReturnToPublish: () => void;
}) {
  const nextGroup = projectsLoading ? undefined : readinessGroups.find((group) => !group.complete);
  const totalSteps = readinessGroups.length + 1;
  const completeCount = readinessGroups.filter((group) => group.complete).length + (hasReviewedPreview ? 1 : 0);

  return (
    <div className="md:hidden mb-3 flex w-[calc(100%-3rem)] max-w-[1000px] items-center justify-between gap-3 rounded-2xl bg-spotify-dark-surface px-4 py-3 shadow-spotify">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-white">
          {portfolioState === "published" ? "공개 중" : projectsLoading ? "공개 준비 확인 중" : `공개 준비 ${completeCount}/${totalSteps}`}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-spotify-silver">
          {portfolioState === "published"
            ? "변경사항은 자동으로 반영돼요."
            : projectsLoading
              ? "GitHub 프로젝트 상태를 확인하고 있어요."
              : nextGroup
              ? `${nextGroup.label}을(를) 준비해주세요.`
              : hasReviewedPreview
                ? "공개할 준비가 됐어요."
                : "미리보기만 확인하면 공개할 수 있어요."}
        </p>
      </div>
      {nextGroup ? (
        <Button size="sm" variant="ghost" className="h-8 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={() => onAction(nextGroup.destination)}>
          {nextGroup.action}
        </Button>
      ) : portfolioState !== "published" ? (
        <Button size="sm" variant="ghost" className="h-8 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={onReturnToPublish}>
          공개 준비로
        </Button>
      ) : null}
    </div>
  );
}
