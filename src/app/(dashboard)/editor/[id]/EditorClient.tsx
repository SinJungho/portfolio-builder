"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Globe,
  Grid,
  Loader2,
  Mail,
  Plus,
  Rss,
  Sparkles,
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
import { type RawProject } from "@/types/project";
import { type PortfolioInitialData } from "@/types/portfolio";
import {
  getPortfolioState,
  portfolioStateLabel,
} from "@/lib/portfolio-state";
import {
  type EditorDestination,
  type PortfolioReadinessItem,
  getPortfolioReadiness,
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

const blockTypeLabels: Record<string, string> = {
  hero: "소개",
  project_grid: "프로젝트",
  skills: "기술 스택",
  contact: "연락처",
  blog_feed: "블로그",
};

type SidebarTab = "blocks" | "publish" | "design";

export default function EditorClient({
  initialData,
}: {
  initialData: PortfolioInitialData;
}) {
  const {
    blocks,
    theme,
    designTokens,
    isSaving,
    isPublished,
    initialize,
    toggleBlock,
    reorderBlocks,
    updateOptionalField,
    deleteBlock,
    updateBlockConfig,
    addBlock,
    setPublished,
  } = usePortfolioStore();

  const [init] = useState<boolean>(() => {
    initialize({
      ...initialData,
      blocks: initialData.blocks.map((b: Block) => ({
        ...b,
        block_type: b.block_type,
      })),
    });
    return true;
  });

  // React 18 비동기 렌더링 전환 훅 ( 사이드바 탭 클릭 시의 미세 렉 완화 )
  const [isPending, startTransition] = useTransition();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("publish");
  const [isPreviewing, setIsPreviewing] = useState(false);
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
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >({});
  const [saveError, setSaveError] = useState<{ message: string; retry: () => void } | null>(null);
  const [lastBlockOrder, setLastBlockOrder] = useState<Block[] | null>(null);

  const { data: rawProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: init,
  });

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
      reorderBlocks(newBlocks);
    }
  };

  const undoBlockOrder = () => {
    if (!lastBlockOrder) return;
    const restored = lastBlockOrder.map((block, index) => ({ ...block, config: { ...block.config }, position: index }));
    reorderBlocks(restored);
    setLastBlockOrder(null);
  };

  const contactBlock = blocks.find((b: Block) => b.block_type === "contact");
  const portfolioState = getPortfolioState(isPublished, blocks.length);
  const readinessItems = getPortfolioReadiness(blocks);

  const handleOptionalChange = (field: string, value: string) => {
    if (!contactBlock) return;
    setSaveError(null);
    updateOptionalField(contactBlock.id, { [field]: value })
      .then(() => toast.success("연락처 정보가 저장되었습니다."))
      .catch(() => {
        setSaveError({ message: "연락처 정보를 저장하지 못했습니다.", retry: () => handleOptionalChange(field, value) });
        toast.error("연락처 정보를 저장하지 못했습니다. 다시 시도해주세요.");
      });
  };

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
  };

  const confirmPreviewReview = () => {
    sessionStorage.setItem(previewReviewStorageKey, previewSignature);
    setReviewedPreviewSignature(previewSignature);
  };

  const handlePublish = async () => {
    setSaveError(null);
    const nextItem = readinessItems.find((item) => !item.complete);
    if (nextItem) {
      toast.error(`${nextItem.label}을(를) 먼저 준비해주세요.`);
      handleReadinessAction(nextItem.destination);
      return;
    }

    if (!hasReviewedPreview) {
      handleTabChange("publish");
      toast.error("미리보기를 확인한 뒤 공개해 주세요.");
      return;
    }

    try {
      await setPublished(true);
      toast.success("공개되었습니다. 이제 링크를 복사해 지원서에 넣어보세요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "공개하지 못했습니다.";
      setSaveError({ message, retry: handlePublish });
      toast.error(message);
    }
  };

  const handleUnpublish = async () => {
    setSaveError(null);
    try {
      await setPublished(false);
      toast.success("공개를 중지했습니다. 편집 내용은 그대로 보관돼요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "공개를 중지하지 못했습니다.";
      setSaveError({ message, retry: handleUnpublish });
      toast.error(message);
    }
  };

  const focusContactField = () => {
    setIsPreviewing(false);
    handleTabChange("publish");
    window.setTimeout(() => document.getElementById("email")?.focus(), 0);
  };

  const handleReadinessAction = async (destination: EditorDestination) => {
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
      if (contactBlock && !contactBlock.is_visible) await toggleBlock(contactBlock.id);
      if (!contactBlock) await addBlock("contact");
      focusContactField();
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
  };

  const openProjectEditor = (block: Block) => {
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
    }
  };

  useEffect(() => {
    if (!focusItem || handledFocusItem.current === focusItem) return;
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
        toast.success("대표 리포지토리 설정이 업데이트되었습니다.");
      });
    }
  };

  const handleSaveBlockConfig = (config: Record<string, unknown>) => {
    if (!editingBlockId) return;
    updateBlockConfig(editingBlockId, config).then(() => {
      setIsEditingHero(false);
      setIsEditingSkills(false);
      setIsEditingBlogFeed(false);
      setEditingBlockId(null);
      toast.success("섹션 설정이 업데이트되었습니다.");
    });
  };

  if (!init) {
    return (
      <div className="flex justify-center p-12 h-screen items-center bg-spotify-near-black">
        <Loader2 className="animate-spin w-8 h-8 text-spotify-green" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full bg-spotify-near-black overflow-hidden text-white">
      {/* 상단 헤더 영역 */}
      <header className="h-14 border-b border-white/5 bg-spotify-near-black flex items-center justify-between px-6 shrink-0 z-20">
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
        <aside className={`${isPreviewing ? "hidden" : "flex"} w-full md:w-[380px] lg:w-[420px] shrink-0 border-r border-white/5 bg-spotify-dark-surface md:flex flex-col z-10 shadow-spotify`}>
          <div role="tablist" aria-label="포트폴리오 편집 단계" className="flex p-3 gap-2 bg-spotify-near-black border-b border-white/5 shrink-0">
            <button
              id="editor-tab-publish"
              onClick={() => handleTabChange("publish")}
              onKeyDown={(event) => handleTabKeyDown(event, "publish")}
              className={`flex-1 cursor-pointer rounded-full py-2.5 text-[13px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${
                sidebarTab === "publish"
                  ? "bg-spotify-green text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
              type="button"
              role="tab"
              aria-selected={sidebarTab === "publish"}
              aria-controls="editor-panel-publish"
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
              aria-controls="editor-panel-blocks"
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
              aria-controls="editor-panel-design"
              tabIndex={sidebarTab === "design" ? 0 : -1}
            >
              디자인
            </button>
          </div>
          <div role="tabpanel" id={`editor-panel-${sidebarTab}`} aria-labelledby={`editor-tab-${sidebarTab}`} className="flex-1 overflow-y-auto p-5 md:p-6 bg-spotify-dark-surface">
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
                isSaving={isSaving}
                addBlock={addBlock}
              />
            ) : sidebarTab === "publish" ? (
              <SettingsPanel
                initialData={initialData}
                contactBlock={contactBlock}
                handleOptionalChange={handleOptionalChange}
                portfolioState={portfolioState}
                isSaving={isSaving}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                readinessItems={readinessItems}
                onReadinessAction={handleReadinessAction}
                onPreview={openPreview}
                previewOpened={previewOpened}
                hasReviewedPreview={hasReviewedPreview}
                onReviewPreview={confirmPreviewReview}
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
            readinessItems={readinessItems}
            onAction={handleReadinessAction}
            onReturnToPublish={() => {
              setIsPreviewing(false);
              handleTabChange("publish");
            }}
          />
          <div className="w-full max-w-[1000px] bg-spotify-dark-surface rounded-t-2xl md:rounded-2xl overflow-hidden shadow-spotify mx-6 relative animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="h-10 bg-spotify-near-black border-b border-white/5 flex items-center justify-between px-4 shrink-0">
            <span className="text-[11px] font-bold text-spotify-silver">{isPublished ? "공개됨" : "초안 미리보기"}</span>
            <div className="bg-spotify-mid-dark border border-white/5 rounded-full px-4 py-1 text-[11px] text-spotify-silver font-mono flex items-center gap-2 shadow-inner">
              <Globe className="w-3.5 h-3.5 text-spotify-silver/50" />
              {initialData?.slug}.portfolioforge.app
            </div>
          </div>

            {/* 실시간으로 연동되는 뷰포트 영역 (Deferred Value를 통해 인풋 타이핑 반응성 보존) */}
            <div className="w-full h-full min-h-[800px] overflow-hidden bg-white">
              <PortfolioPreview
                blocks={deferredBlocks}
                theme={deferredTheme}
                designTokens={deferredDesignTokens}
                slug={initialData?.slug || undefined}
                portfolioId={initialData?.portfolioId}
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
        isOpen={isEditingBlogFeed}
        onClose={() => {
          setIsEditingBlogFeed(false);
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
  isSaving,
  addBlock,
}: BlocksPanelProps) {
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
                onToggle={toggleBlock}
                onDelete={deleteBlock}
                onOpenProjectEditor={openProjectEditor}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      {blocks.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 bg-spotify-near-black/20 rounded-[20px] gap-3">
          <div className="p-3 bg-white/5 rounded-full text-spotify-silver">
            <Grid className="w-6 h-6" />
          </div>
          <p className="text-spotify-silver font-bold text-[14px]">
            아직 추가된 섹션이 없어요.
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-white/5 mt-6">
        <div className="flex flex-col gap-1 mb-4 px-1">
          <h4 className="text-[15px] font-bold text-white">새 섹션 추가</h4>
          <p className="text-[12px] text-spotify-silver font-medium">
            내 포트폴리오를 더 풍성하게 만들어보세요.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(blockTypeLabels).map((type: string) => {
            const isUnique = type === "hero" || type === "contact";
            const alreadyExists =
              isUnique && blocks.some((b: Block) => b.block_type === type);

            return (
              <button
                key={type}
                onClick={() => addBlock(type)}
                disabled={isSaving || alreadyExists}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all border cursor-pointer
                  ${
                    alreadyExists
                      ? "bg-spotify-near-black border-white/5 text-spotify-silver/30 cursor-not-allowed"
                      : "bg-spotify-near-black border-white/5 text-white hover:border-spotify-green hover:text-spotify-green hover:bg-spotify-mid-dark active:scale-95"
                  }
                `}
                type="button"
              >
                {alreadyExists ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {blockTypeLabels[type]}
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
  contactBlock: Block | undefined;
  handleOptionalChange: (field: string, value: string) => void;
  portfolioState: ReturnType<typeof getPortfolioState>;
  isSaving: boolean;
  onPublish: () => void;
  onUnpublish: () => void;
  readinessItems: PortfolioReadinessItem[];
  onReadinessAction: (destination: EditorDestination) => void;
  onPreview: () => void;
  previewOpened: boolean;
  hasReviewedPreview: boolean;
  onReviewPreview: () => void;
}

const SettingsPanel = React.memo(function SettingsPanel({
  initialData,
  contactBlock,
  handleOptionalChange,
  portfolioState,
  isSaving,
  onPublish,
  onUnpublish,
  readinessItems,
  onReadinessAction,
  onPreview,
  previewOpened,
  hasReviewedPreview,
  onReviewPreview,
}: SettingsPanelProps) {
  const publishedPath = initialData.slug ? `/${initialData.slug}` : null;
  const nextItem = readinessItems.find((item) => !item.complete);

  return (
    <div className="space-y-6">
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[24px] p-6 shadow-spotify text-white space-y-6">
        <div className="space-y-1">
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-spotify-green" />
            공개 준비도
          </h3>
          <p className="text-[12px] text-spotify-silver font-medium">
            채용 담당자가 빠르게 읽을 수 있는지 확인한 뒤 공개하세요.
          </p>
        </div>

        <ul className="space-y-2" aria-label="공개 전 확인 항목">
          {readinessItems.map((item) => (
            <li key={item.label} className="flex items-center gap-3 text-[12px] font-bold">
              <Check className={`h-4 w-4 shrink-0 ${item.complete ? "text-spotify-green" : "text-white/40"}`} aria-hidden="true" />
              <span className={item.complete ? "text-white" : "text-spotify-silver"}>{item.label}</span>
              {item.complete ? (
                <span className="ml-auto text-[11px] font-medium text-spotify-silver">완료</span>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto h-7 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10"
                  onClick={() => onReadinessAction(item.destination)}
                >
                  {item.action}
                </Button>
              )}
            </li>
          ))}
          <li className="flex items-center gap-3 text-[12px] font-bold">
            <Check className={`h-4 w-4 shrink-0 ${hasReviewedPreview ? "text-spotify-green" : "text-white/40"}`} aria-hidden="true" />
            <span className={hasReviewedPreview ? "text-white" : "text-spotify-silver"}>미리보기 확인</span>
            {hasReviewedPreview ? (
              <span className="ml-auto text-[11px] font-medium text-spotify-silver">완료</span>
            ) : (
              <div className="ml-auto flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" className="h-7 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={onPreview}>
                  <Eye className="h-3.5 w-3.5" /> 미리보기 열기
                </Button>
                <Button type="button" variant="ghost" size="sm" className="h-7 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" disabled={!previewOpened} onClick={onReviewPreview}>
                  확인했어요
                </Button>
              </div>
            )}
          </li>
        </ul>

        {portfolioState !== "published" && (
          <div className="flex items-center justify-between gap-3 border-t border-white/5 pt-4">
            <p className="text-[12px] text-spotify-silver">
              {nextItem ? `${nextItem.label}을(를) 먼저 채워보세요.` : hasReviewedPreview ? "공개할 준비가 됐어요." : "미리보기를 열고 확인해 주세요."}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="shrink-0 h-9 rounded-full px-4 text-[12px] font-bold text-white hover:bg-white/10"
              onClick={() => nextItem ? onReadinessAction(nextItem.destination) : hasReviewedPreview ? onPublish() : onPreview()}
            >
              {nextItem ? nextItem.action : hasReviewedPreview ? "공개하기" : <><Eye className="h-3.5 w-3.5" /> 미리보기</>}
            </Button>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-[10px] font-bold uppercase text-spotify-silver tracking-wider">
            기본 주소
          </Label>
          <div className="flex flex-col gap-3 p-3 bg-white/5 border border-white/5 rounded-xl">
            <div className="flex items-center gap-2 min-w-0">
              <Globe className="w-4 h-4 text-spotify-green shrink-0" />
              <span className="text-[13px] font-bold text-white font-mono truncate">
                {initialData?.slug}.portfolioforge.app
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
                  <Button variant="ghost" size="sm" className="h-7 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" onClick={() => {
                    navigator.clipboard.writeText(new URL(publishedPath, window.location.origin).href);
                    toast.success("공개 링크를 복사했습니다.");
                  }}>
                    <Copy className="w-3 h-3" /> 링크 복사
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" onClick={() => window.open(publishedPath, "_blank")}>
                    <ArrowUpRight className="w-3 h-3" /> 열기
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 rounded-full px-3 text-[11px] font-bold text-spotify-silver hover:bg-white/10 hover:text-white" disabled={isSaving} onClick={onUnpublish}>
                    공개 중지
                  </Button>
                </>
              ) : nextItem ? (
                <Button size="sm" className="h-9 rounded-full px-4 text-[11px] font-bold text-white hover:bg-white/10" variant="ghost" disabled={isSaving} onClick={() => onReadinessAction(nextItem.destination)}>
                  {nextItem.action}
                </Button>
              ) : portfolioState === "preview" ? (
                <Button size="sm" className="btn-pill-primary h-9 px-4 text-[11px]" disabled={isSaving || !hasReviewedPreview} onClick={onPublish}>
                  공개하기
                </Button>
              ) : (
                <span className="text-[11px] font-medium text-spotify-silver">섹션을 추가하면 공개할 수 있어요.</span>
              )}
            </div>
          </div>
          {portfolioState === "published" && (
            <p className="text-[11px] leading-relaxed text-spotify-silver">
              변경사항은 공개 페이지에 자동 반영되며, 언제든 공개를 중지할 수 있어요.
            </p>
          )}
        </div>
      </div>

      <div className="bg-spotify-dark-surface border border-white/5 rounded-[24px] p-5 shadow-spotify space-y-5 text-white">
        <div className="space-y-1">
          <h3 className="text-[16px] font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-spotify-green" />
            연락처 보완
          </h3>
        </div>
        {contactBlock ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-spotify-silver"
              >
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                className="rounded-full bg-spotify-near-black border border-white/5 text-white focus:border-spotify-green placeholder:text-spotify-silver/50 text-xs px-5 h-10"
                defaultValue={(contactBlock.config?.email as string) || ""}
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleOptionalChange("email", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="linkedin"
                className="text-xs font-bold text-spotify-silver"
              >
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="rounded-full bg-spotify-near-black border border-white/5 text-white focus:border-spotify-green placeholder:text-spotify-silver/50 text-xs px-5 h-10"
                defaultValue={
                  (contactBlock.config?.linkedin_url as string) || ""
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleOptionalChange("linkedin_url", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label
                htmlFor="website"
                className="text-xs font-bold text-spotify-silver"
              >
                개인 웹사이트
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                className="rounded-full bg-spotify-near-black border border-white/5 text-white focus:border-spotify-green placeholder:text-spotify-silver/50 text-xs px-5 h-10"
                defaultValue={
                  (contactBlock.config?.website_url as string) || ""
                }
                onBlur={(e: React.FocusEvent<HTMLInputElement>) =>
                  handleOptionalChange("website_url", e.target.value)
                }
              />
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-spotify-silver bg-spotify-near-black p-4 rounded-xl text-center font-medium">
            아직 연락처 섹션이 없어요.
          </div>
        )}
      </div>

    </div>
  );
});

function DesignPanel() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-[17px] font-bold tracking-tight text-white">디자인</h2>
        <p className="mt-1 text-[12px] font-medium text-spotify-silver">테마와 도메인은 공개 준비와 분리해 언제든 조정할 수 있어요.</p>
      </div>
      <DesignEditor />
      <CustomDomainSection />
    </div>
  );
}

function MobilePreviewStatus({
  portfolioState,
  readinessItems,
  onAction,
  onReturnToPublish,
}: Pick<SettingsPanelProps, "portfolioState" | "readinessItems"> & {
  onAction: (destination: EditorDestination) => void;
  onReturnToPublish: () => void;
}) {
  const nextItem = readinessItems.find((item) => !item.complete);
  const completeCount = readinessItems.filter((item) => item.complete).length;

  return (
    <div className="md:hidden mb-3 flex w-[calc(100%-3rem)] max-w-[1000px] items-center justify-between gap-3 rounded-2xl bg-spotify-dark-surface px-4 py-3 shadow-spotify">
      <div className="min-w-0">
        <p className="text-[12px] font-bold text-white">
          {portfolioState === "published" ? "공개 중" : `공개 준비 ${completeCount}/${readinessItems.length}`}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-spotify-silver">
          {portfolioState === "published"
            ? "변경사항은 자동으로 반영돼요."
            : nextItem ? `${nextItem.label}을(를) 준비해주세요.` : "공개할 준비가 됐어요."}
        </p>
      </div>
      {nextItem ? (
        <Button size="sm" variant="ghost" className="h-8 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={() => onAction(nextItem.destination)}>
          {nextItem.action}
        </Button>
      ) : portfolioState !== "published" ? (
        <Button size="sm" variant="ghost" className="h-8 shrink-0 rounded-full px-3 text-[11px] font-bold text-white hover:bg-white/10" onClick={onReturnToPublish}>
          공개 준비로
        </Button>
      ) : null}
    </div>
  );
}
