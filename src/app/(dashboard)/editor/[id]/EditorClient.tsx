"use client";

import { type Block, usePortfolioStore } from "@/stores/portfolioStore";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import React, { useDeferredValue, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import ProjectSelectionModal from "./components/ProjectSelectionModal";
import HeroEditorModal from "./components/HeroEditorModal";
import SkillsEditorModal from "./components/SkillsEditorModal";
import BlogFeedEditorModal from "./components/BlogFeedEditorModal";
import ContactEditorModal from "./components/ContactEditorModal";
import BlocksPanel from "./components/BlocksPanel";
import SettingsPanel from "./components/SettingsPanel";
import DesignPanel from "./components/DesignPanel";
import EditorHeader from "./components/EditorHeader";
import EditorSidebar, { type SidebarTab } from "./components/EditorSidebar";
import PreviewPane, { MobilePreviewStatus, type PreviewViewport } from "./components/PreviewPane";
import { type RawProject } from "@/types/project";
import { type PortfolioInitialData, type PublishedSnapshot } from "@/types/portfolio";
import type { DesignTokens } from "@/schemas/portfolio";
import { getPortfolioState } from "@/lib/portfolio-state";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";
import {
  type EditorDestination,
  getPortfolioReadiness,
  getPortfolioReadinessGroups,
} from "@/lib/portfolio-readiness";

import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";


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

  const [isPending, startTransition] = useTransition();
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>(
    initialData.isPublished ? "blocks" : "publish",
  );
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [previewViewport, setPreviewViewport] = useState<PreviewViewport>("desktop");
  const previewRef = useRef<HTMLDivElement>(null);
  const previewReviewStorageKey = `portfolio-preview-reviewed:${initialData.portfolioId}`;
  const publishedSnapshotStorageKey = `portfolio-published-snapshot:${initialData.portfolioId}`;
  const [publishedSnapshot, setPublishedSnapshot] = useState<PublishedSnapshot | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = window.localStorage.getItem(publishedSnapshotStorageKey);
      if (stored) return JSON.parse(stored) as PublishedSnapshot;
      return initialData.isPublished
        ? {
            theme: initialData.theme,
            designTokens: initialData.designTokens || {},
            blocks: initialData.blocks.map((block) => ({ ...block, config: { ...block.config } })),
            savedAt: new Date(0).toISOString(),
          }
        : null;
    } catch {
      return null;
    }
  });
  const previewSignature = JSON.stringify({ blocks, theme, designTokens });
  const [openedPreviewSignature, setOpenedPreviewSignature] = useState<string | null>(null);
  const [reviewedPreviewSignature, setReviewedPreviewSignature] = useState(() =>
    typeof window === "undefined" ? null : sessionStorage.getItem(previewReviewStorageKey),
  );
  const previewOpened = openedPreviewSignature === previewSignature;
  const hasReviewedPreview = reviewedPreviewSignature === previewSignature;
  const focusItem = useSearchParams().get("focus");
  const handledFocusItem = useRef<string | null>(null);

  // 미리보기는 입력 변경과 분리해 렌더링한다.
  const deferredBlocks = useDeferredValue(blocks);
  const deferredTheme = useDeferredValue(theme);
  const deferredDesignTokens = useDeferredValue(designTokens);

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
  const [justPublished, setJustPublished] = useState(false);
  const [isRestoringPublished, setIsRestoringPublished] = useState(false);

  const persistPublishedSnapshot = () => {
    const snapshot: PublishedSnapshot = {
      theme,
      designTokens,
      blocks: blocks.map((block) => ({ ...block, config: { ...block.config } })),
      savedAt: new Date().toISOString(),
    };
    // 브라우저 저장소가 차단돼도 이번 세션의 복원 기준은 최신 공개본이어야 한다.
    setPublishedSnapshot(snapshot);
    try {
      window.localStorage.setItem(publishedSnapshotStorageKey, JSON.stringify(snapshot));
    } catch {
      // 공개 자체는 성공했으므로 브라우저 저장 실패가 공개 흐름을 막지 않게 한다.
    }
  };

  const { data: rawProjects, isLoading: projectsLoading, isError: projectsLoadFailed, refetch: refetchProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(responseErrorMessage(payload, "PROJECT_LIST_FAILED"));
      return payload;
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
      // 스토어 객체는 immer로 동결돼 있어 직접 변형하면 TypeError가 난다. 복사본에 순서를 매긴다.
      const newBlocks = arrayMove(blocks, oldIndex, newIndex).map((block: Block, i: number) => ({
        ...block,
        config: { ...block.config },
        position: i,
      }));
      void reorderBlocks(newBlocks).catch(() => {
        toast.error(errorMessage("SECTION_ORDER_SAVE_FAILED"));
      });
    }
  };

  const undoBlockOrder = () => {
    if (!lastBlockOrder) return;
    const restored = lastBlockOrder.map((block, index) => ({ ...block, config: { ...block.config }, position: index }));
    void reorderBlocks(restored)
      .then(() => setLastBlockOrder(null))
      .catch(() => toast.error(errorMessage("SECTION_ORDER_RESTORE_FAILED")));
  };

  const contactBlock = blocks.find((b: Block) => b.block_type === "contact");
  const portfolioState = getPortfolioState(isPublished, blocks.length);
  const readinessItems = getPortfolioReadiness(
    blocks,
    rawProjects?.map((project) => project.id) ?? [],
    rawProjects
      ?.filter((project) => Boolean(project.description?.trim() || project.ai_summary?.trim()))
      .map((project) => project.id) ?? [],
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

  const revealPreview = () => {
    setIsPreviewing(true);
    requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      previewRef.current?.focus({ preventScroll: true });
    });
  };

  const openPreview = () => {
    setOpenedPreviewSignature(previewSignature);
    revealPreview();
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

    try {
      await setPublished(true);
      persistPublishedSnapshot();
      setJustPublished(true);
      toast.success("공개했어요. 이제 링크를 복사해 지원서에 넣어보세요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage("PUBLISH_FAILED");
      setSaveError({ message, retry: handlePublish });
      toast.error(message);
    }
  };

  const handleRestorePublished = async () => {
    if (!publishedSnapshot || isRestoringPublished) return;
    setSaveError(null);
    setIsRestoringPublished(true);
    try {
      const res = await fetch(`/api/portfolios/${initialData.portfolioId}/snapshot`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: publishedSnapshot.theme,
          design_tokens: publishedSnapshot.designTokens,
          blocks: publishedSnapshot.blocks,
        }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        const message = payload && typeof payload.error === "string"
          ? payload.error
          : "마지막 공개본을 복원하지 못했어요.";
        throw new Error(message);
      }
      initialize({
        ...initialData,
        // 공개본 복원은 콘텐츠와 디자인만 바꾼다. 현재 도메인은 그대로 유지한다.
        customDomain,
        blocks: publishedSnapshot.blocks,
        theme: publishedSnapshot.theme,
        designTokens: publishedSnapshot.designTokens,
        isPublished: true,
      });
      setJustPublished(false);
      toast.success("마지막 공개본으로 되돌렸어요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "마지막 공개본을 복원하지 못했어요.";
      setSaveError({ message, retry: () => void handleRestorePublished() });
      toast.error(message);
    } finally {
      setIsRestoringPublished(false);
    }
  };

  const handleUnpublish = async () => {
    setSaveError(null);
    try {
      await setPublished(false);
      setJustPublished(false);
      toast.success("공개를 중지했어요. 편집 내용은 그대로 보관돼요.");
    } catch (error) {
      const message = error instanceof Error ? error.message : errorMessage("UNPUBLISH_FAILED");
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
      toast.error(errorMessage("SECTION_SAVE_FAILED"));
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
    // URL focus를 탭 또는 준비 항목으로 한 번만 연결한다.
    if (focusItem === "blocks" || focusItem === "publish") {
      handledFocusItem.current = focusItem;
      handleTabChange(focusItem);
      return;
    }
    if (!["hero", "projects", "contact"].includes(focusItem)) return;
    handledFocusItem.current = focusItem;
    void handleReadinessAction(focusItem as EditorDestination);
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
        revealPreview();
        setSaveError(null);
        toast.success("대표 프로젝트 설정을 업데이트했어요.");
      }).catch(() => {
        setSaveError({
          message: errorMessage("PROJECT_CONFIG_SAVE_FAILED"),
          retry: () => handleSaveProjects(selectedIds, customDescriptions),
        });
        toast.error(errorMessage("PROJECT_CONFIG_SAVE_FAILED"));
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
      revealPreview();
      setSaveError(null);
      toast.success("콘텐츠 설정을 업데이트했어요.");
    }).catch(() => {
      setSaveError({
        message: errorMessage("SECTION_SAVE_FAILED"),
        retry: () => handleSaveBlockConfig(config),
      });
      toast.error(errorMessage("SECTION_SAVE_FAILED"));
    });
  };

  if (!init) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-spotify-near-black p-12" role="status" aria-live="polite">
        <Loader2 className="animate-spin w-8 h-8 text-spotify-green" aria-hidden="true" />
        <span className="sr-only">포트폴리오 편집기를 불러오는 중</span>
      </div>
    );
  }

  const previewWidth = { desktop: "1000px", tablet: "768px", mobile: "390px" }[previewViewport];

  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-spotify-near-black text-white md:-ml-64 md:w-[calc(100%+16rem)]">
      <EditorHeader
        isPublished={isPublished}
        lastBlockOrder={Boolean(lastBlockOrder)}
        onUndoBlockOrder={undoBlockOrder}
        isSaving={isSaving || isRestoringPublished}
        isPreviewing={isPreviewing}
        onTogglePreview={() => setIsPreviewing((previewing) => !previewing)}
        isInspectorOpen={isInspectorOpen}
        onToggleInspector={() => setIsInspectorOpen((open) => !open)}
        saveError={saveError}
      />

      <div className="flex flex-1 overflow-hidden relative">
        <EditorSidebar
          isPreviewing={isPreviewing}
          isInspectorOpen={isInspectorOpen}
          sidebarTab={sidebarTab}
          onTabChange={handleTabChange}
          onTabKeyDown={handleTabKeyDown}
          isPending={isPending}
        >
          {sidebarTab === "blocks" ? (
              <BlocksPanel
                blocks={blocks}
                sensors={sensors}
                handleDragEnd={handleDragEnd}
                toggleBlock={toggleBlock}
                deleteBlock={deleteBlock}
                openProjectEditor={openProjectEditor}
                highlightPreviewBlock={setPreviewHighlightedBlockId}
                isSaving={isSaving || isRestoringPublished}
                addBlock={addBlock}
              />
            ) : sidebarTab === "publish" ? (
              <SettingsPanel
                initialData={initialData}
                theme={theme}
                designTokens={designTokens as DesignTokens}
                customDomain={customDomain}
                portfolioState={portfolioState}
                isSaving={isSaving || isRestoringPublished}
                onPublish={handlePublish}
                onUnpublish={handleUnpublish}
                readinessGroups={readinessGroups}
                projectsLoading={projectsLoading}
                projectsLoadFailed={projectsLoadFailed}
                onRetryProjects={() => void refetchProjects()}
                onReadinessAction={handleReadinessAction}
                onPreview={openPreview}
                previewOpened={previewOpened}
                hasReviewedPreview={hasReviewedPreview}
                hasReviewedOnce={reviewedPreviewSignature !== null}
                onReviewPreview={confirmPreviewReview}
                justPublished={justPublished}
                publishedSnapshot={publishedSnapshot}
                onRestorePublished={() => void handleRestorePublished()}
              />
            ) : (
              <DesignPanel />
            )}
        </EditorSidebar>

        <PreviewPane
          isPreviewing={isPreviewing}
          isInspectorOpen={isInspectorOpen}
          onOpenInspector={() => setIsInspectorOpen(true)}
          isPublished={isPublished}
          slug={initialData.slug}
          customDomain={customDomain}
          previewWidth={previewWidth}
          previewRef={previewRef}
          projectsLoadFailed={projectsLoadFailed}
          onRetryProjects={() => void refetchProjects()}
          mobileStatus={
            <MobilePreviewStatus
              portfolioState={portfolioState}
              readinessGroups={readinessGroups}
              projectsLoading={projectsLoading}
              projectsLoadFailed={projectsLoadFailed}
              hasReviewedPreview={hasReviewedPreview}
              isSaving={isSaving || isRestoringPublished}
              hasSaveError={Boolean(saveError)}
              onAction={handleReadinessAction}
              onRetryProjects={() => void refetchProjects()}
              onReturnToPublish={() => {
                setIsPreviewing(false);
                handleTabChange("publish");
              }}
              onReviewPreview={confirmPreviewReview}
            />
          }
          previewBlocks={previewBlocks}
          theme={deferredTheme}
          designTokens={deferredDesignTokens as DesignTokens}
          portfolioId={initialData.portfolioId}
          previewViewport={previewViewport}
          onViewportChange={setPreviewViewport}
          highlightedBlockId={previewHighlightedBlockId}
          onSelectBlock={handlePreviewBlockSelect}
        />
      </div>

      <ProjectSelectionModal
        key={`project-editor-${editingBlockId ?? "new"}-${isEditingProjects ? "open" : "closed"}`}
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
