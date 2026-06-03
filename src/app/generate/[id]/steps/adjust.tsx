"use client";

import React, { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Block, usePortfolioStore } from "@/stores/portfolioStore";
import { type RawProject } from "@/types/project";
import { type PortfolioInitialData } from "@/types/portfolio";
import { toast } from "sonner";

import DesignEditor from "@/components/features/editor/DesignEditor";
import {
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import { BlocksPanel } from "./components/BlocksPanel";
import { DomainSettingsPanel } from "./components/DomainSettingsPanel";
import { ContactSettingsPanel } from "./components/ContactSettingsPanel";
import { ProjectSelectionModal } from "./components/ProjectSelectionModal";

type MobileTab = "blocks" | "settings";

interface AdjustStepProps {
  initialData?: PortfolioInitialData;
}

export default function AdjustStep({ initialData }: AdjustStepProps): React.ReactElement {
  const {
    blocks,
    isSaving,
    initialize,
    toggleBlock,
    reorderBlocks,
    updateOptionalField,
    deleteBlock,
    updateBlockConfig,
    addBlock,
    customDomain,
    setCustomDomain,
  } = usePortfolioStore();

  const [init, setInit] = useState<boolean>(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");

  // 대표 프로젝트 편집 오버레이 모달용 상태 관리
  const [isEditingProjects, setIsEditingProjects] = useState<boolean>(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 대표 프로젝트 선택 모달 오픈 시 동기 패칭
  const { data: rawProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: init,
  });

  // 1회성 데이터 마이그레이션 및 스토어 바인딩 (리액트 공식 렌더링 도중 초기화 패턴 활용)
  if (initialData && !init) {
    initialize({
      ...initialData,
      blocks: initialData.blocks.map((b) => ({
        ...b,
        block_type: b.block_type as Block["block_type"],
      })),
    });
    setInit(true);
  }

  // 순서 위로 이동
  const moveUp = useCallback((index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    newBlocks.forEach((b, i) => (b.position = i));
    reorderBlocks(newBlocks);
  }, [blocks, reorderBlocks]);

  // 순서 아래로 이동
  const moveDown = useCallback((index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index + 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index + 1],
    ];
    newBlocks.forEach((b, i) => (b.position = i));
    reorderBlocks(newBlocks);
  }, [blocks, reorderBlocks]);

  // Dnd-kit 센서 정비 (마찰 활성 거리 5px 제공)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 드래그 앤 드롭 이동 완료 핸들러
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      newBlocks.forEach((b, i) => (b.position = i));
      reorderBlocks(newBlocks);
    }
  }, [blocks, reorderBlocks]);

  const contactBlock = blocks.find((b) => b.block_type === "contact");

  // 연락처 보완 blur 동기화 핸들러
  const handleOptionalChange = useCallback((field: string, value: string) => {
    if (!contactBlock) return;
    updateOptionalField(contactBlock.id, { [field]: value }).then(() => {
      toast.success("저장되었습니다");
    });
  }, [contactBlock, updateOptionalField]);

  // 대표 프로젝트 편집 모달 활성화
  const openProjectEditor = useCallback((block: Block) => {
    setEditingBlockId(block.id);
    setTempSelectedIds((block.config.project_ids as string[]) || []);
    setTempCustomDescriptions(
      (block.config.custom_descriptions as Record<string, string>) || {},
    );
    setIsEditingProjects(true);
  }, []);

  // 대표 프로젝트 설정값 영구 동기화
  const saveProjectChanges = useCallback(() => {
    if (!editingBlockId) return;
    const block = blocks.find((b) => b.id === editingBlockId);
    if (block) {
      updateBlockConfig(editingBlockId, {
        ...block.config,
        project_ids: tempSelectedIds,
        custom_descriptions: tempCustomDescriptions,
      }).then(() => {
        setIsEditingProjects(false);
        setEditingBlockId(null);
        toast.success("대표 리포지토리 설정이 업데이트되었습니다.");
      });
    }
  }, [editingBlockId, blocks, tempSelectedIds, tempCustomDescriptions, updateBlockConfig]);

  // 대표 리포지토리 토글 선택
  const toggleTempProject = useCallback((id: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  // 마크다운 소개 타이핑 동기화 핸들러
  const handleDescriptionChange = useCallback((id: string, value: string): void => {
    setTempCustomDescriptions((prev) => ({
      ...prev,
      [id]: value,
    }));
  }, []);

  const filteredProjects = rawProjects?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (!init) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin w-8 h-8 text-spotify-green" />
      </div>
    );
  }

  // 1. 블록 목록 패널 렌더링
  const BlocksPanelComponent = (
    <BlocksPanel
      blocks={blocks}
      isSaving={isSaving}
      sensors={sensors}
      handleDragEnd={handleDragEnd}
      toggleBlock={toggleBlock}
      deleteBlock={deleteBlock}
      moveUp={moveUp}
      moveDown={moveDown}
      openProjectEditor={openProjectEditor}
      addBlock={addBlock}
    />
  );

  // 2. 설정 패널 렌더링
  const SettingsPanelComponent = (
    <div className="space-y-6">
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-spotify text-white">
        <DesignEditor />
      </div>
      <DomainSettingsPanel
        initialSlug={initialData?.slug || undefined}
        customDomain={customDomain}
        setCustomDomain={setCustomDomain}
      />
      <ContactSettingsPanel
        contactBlock={contactBlock}
        handleOptionalChange={handleOptionalChange}
      />
    </div>
  );

  return (
    <div className="relative min-h-screen bg-spotify-near-black pb-24 text-white">
      {/* 은은한 모눈 격자 조명 배경 */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-7xl pt-4 px-4 gap-6 md:gap-10 mx-auto">
        {/* 모바일 탭 스위처 (lg 미만 화면 전용) */}
        <div className="lg:hidden flex bg-spotify-mid-dark rounded-full p-1.5 gap-1.5 shadow-inner border border-white/5">
          <button
            onClick={() => setMobileTab("blocks")}
            className={`flex-1 text-[14px] font-bold py-3 rounded-full transition-all ${
              mobileTab === "blocks"
                ? "bg-spotify-green text-black shadow-sm"
                : "text-spotify-silver hover:text-white"
            }`}
          >
            블록 관리
          </button>
          <button
            onClick={() => setMobileTab("settings")}
            className={`flex-1 text-[14px] font-bold py-3 rounded-full transition-all ${
              mobileTab === "settings"
                ? "bg-spotify-green text-black shadow-sm"
                : "text-spotify-silver hover:text-white"
            }`}
          >
            스타일 · 연락처
          </button>
        </div>

        {/* 데스크톱: 2열 대칭 레이아웃 */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">{BlocksPanelComponent}</div>
          <div className="space-y-6">{SettingsPanelComponent}</div>
        </div>

        {/* 모바일: 탭 기반 스위치 레이아웃 */}
        <div className="lg:hidden">
          {mobileTab === "blocks" ? BlocksPanelComponent : SettingsPanelComponent}
        </div>
      </div>

      {/* 대표 리포지토리 선택 전체화면 오버레이 모달 (물리적 컴포넌트 격리) */}
      <ProjectSelectionModal
        isOpen={isEditingProjects}
        onClose={() => setIsEditingProjects(false)}
        tempSelectedIds={tempSelectedIds}
        toggleTempProject={toggleTempProject}
        tempCustomDescriptions={tempCustomDescriptions}
        handleDescriptionChange={handleDescriptionChange}
        filteredProjects={filteredProjects}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        saveProjectChanges={saveProjectChanges}
        isSaving={isSaving}
      />
    </div>
  );
}
