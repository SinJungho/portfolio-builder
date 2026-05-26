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
import React, { useDeferredValue, useState, useTransition } from "react";
import { toast } from "sonner";
import CustomDomainSection from "./components/CustomDomainSection";
import ProjectSelectionModal from "./components/ProjectSelectionModal";
import { type RawProject } from "@/types/project";
import { type PortfolioInitialData } from "@/types/portfolio";

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

type SidebarTab = "blocks" | "settings";

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
    initialize,
    toggleBlock,
    reorderBlocks,
    updateOptionalField,
    deleteBlock,
    updateBlockConfig,
    addBlock,
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
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");

  // 무거운 미리보기 스크린의 동기적 리렌더링 차단 ( 드래그 순서 변경 시 프리뷰 지연 반영 )
  const deferredBlocks = useDeferredValue(blocks);
  const deferredTheme = useDeferredValue(theme);
  const deferredDesignTokens = useDeferredValue(designTokens);

  // 대표 프로젝트 편집 관련 모달 상태 관리
  const [isEditingProjects, setIsEditingProjects] = useState<boolean>(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >({});

  const { data: rawProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: init,
  });

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    newBlocks.forEach((b: Block, i: number) => (b.position = i));
    reorderBlocks(newBlocks);
  };

  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index + 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index + 1],
    ];
    newBlocks.forEach((b: Block, i: number) => (b.position = i));
    reorderBlocks(newBlocks);
  };

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
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      newBlocks.forEach((b: Block, i: number) => (b.position = i));
      reorderBlocks(newBlocks);
    }
  };

  const contactBlock = blocks.find((b: Block) => b.block_type === "contact");

  const handleOptionalChange = (field: string, value: string) => {
    if (!contactBlock) return;
    updateOptionalField(contactBlock.id, { [field]: value }).then(() => {
      toast.success("저장되었습니다");
    });
  };

  const handleTabChange = (tab: SidebarTab) => {
    startTransition(() => {
      setSidebarTab(tab);
    });
  };

  const openProjectEditor = (block: Block) => {
    setEditingBlockId(block.id);
    setTempSelectedIds((block.config.project_ids as string[]) || []);
    setTempCustomDescriptions(
      (block.config.custom_descriptions as Record<string, string>) || {},
    );
    setIsEditingProjects(true);
  };

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
        >
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12px] font-bold transition-all">
            {isSaving ? (
              <span className="text-spotify-green flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> 자동 저장 중...
              </span>
            ) : (
              <span className="text-spotify-silver flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-spotify-green" /> 모든
                변경사항 자동 저장됨
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 에디터 메인 레이아웃 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 좌측 사이드바 패널 */}
        <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 border-r border-white/5 bg-spotify-dark-surface flex flex-col z-10 shadow-spotify">
          <div className="flex p-3 gap-2 bg-spotify-near-black border-b border-white/5 shrink-0">
            <button
              onClick={() => handleTabChange("blocks")}
              className={`flex-1 text-[13px] font-bold py-2.5 rounded-full transition-all cursor-pointer ${
                sidebarTab === "blocks"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
              type="button"
            >
              블록 구성
            </button>
            <button
              onClick={() => handleTabChange("settings")}
              className={`flex-1 text-[13px] font-bold py-2.5 rounded-full transition-all cursor-pointer ${
                sidebarTab === "settings"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
              type="button"
            >
              스타일 & 설정
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-spotify-dark-surface">
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
                moveUp={moveUp}
                moveDown={moveDown}
                openProjectEditor={openProjectEditor}
                isSaving={isSaving}
                addBlock={addBlock}
              />
            ) : (
              <SettingsPanel
                initialData={initialData}
                contactBlock={contactBlock}
                handleOptionalChange={handleOptionalChange}
              />
            )}
          </div>
        </aside>

        {/* 우측 실시간 미리보기 스크린 */}
        <main className="hidden md:flex flex-1 bg-spotify-near-black overflow-y-auto relative items-start justify-center pt-8 pb-32">
          {/* 분위기를 살려줄 모눈무늬 그물망 격자 */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
              bg-size-[40px_40px]
            "
          />
          <div className="w-full max-w-[1000px] bg-spotify-dark-surface rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-spotify border border-white/5 mx-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 상단 브라우저 모양 헤더 바 */}
            <div className="h-10 bg-spotify-near-black border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto bg-spotify-mid-dark border border-white/5 rounded-full px-16 py-1 text-[11px] text-spotify-silver font-mono flex items-center gap-2 shadow-inner">
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
  moveUp: (index: number) => void;
  moveDown: (index: number) => void;
  openProjectEditor: (block: Block) => void;
  isSaving: boolean;
  addBlock: (blockType: string) => Promise<void>;
}

const BlocksPanel = React.memo(function BlocksPanel({
  blocks,
  sensors,
  handleDragEnd,
  toggleBlock,
  deleteBlock,
  moveUp,
  moveDown,
  openProjectEditor,
  isSaving,
  addBlock,
}: BlocksPanelProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[17px] font-extrabold tracking-tight text-white flex items-center gap-2">
          블록 순서 및 표시 설정
        </h2>
      </div>
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
            {blocks.map((block: Block, index: number) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                index={index}
                totalBlocks={blocks.length}
                icon={
                  blockTypeIcons[block.block_type] || (
                    <Grid className="w-5 h-5" />
                  )
                }
                onToggle={toggleBlock}
                onDelete={deleteBlock}
                onMoveUp={moveUp}
                onMoveDown={moveDown}
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
            추가된 블록이 없습니다.
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-white/5 mt-6">
        <div className="flex flex-col gap-1 mb-4 px-1">
          <h4 className="text-[15px] font-bold text-white">새로운 블록 추가</h4>
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
}

const SettingsPanel = React.memo(function SettingsPanel({
  initialData,
  contactBlock,
  handleOptionalChange,
}: SettingsPanelProps) {
  return (
    <div className="space-y-6">
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[24px] p-5 shadow-spotify">
        <DesignEditor />
      </div>
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[24px] p-6 shadow-spotify text-white space-y-6">
        <div className="space-y-1">
          <h3 className="text-[16px] font-black text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-spotify-green animate-pulse" />
            도메인 설정
          </h3>
          <p className="text-[12px] text-spotify-silver font-medium">
            고유한 브랜딩 주소로 포트폴리오를 배포하세요.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase text-spotify-silver tracking-wider">
              기본 무료 제공 주소
            </Label>
            <div className="flex flex-col gap-2 p-3 bg-white/5 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-spotify-green shrink-0" />
                <span className="text-[13px] font-bold text-white font-mono truncate">
                  {initialData?.slug}.portfolioforge.app
                </span>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-spotify-green/10 rounded-full text-spotify-green text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_#1ed760]" />
                  Live
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-spotify-silver hover:text-white hover:bg-white/10 text-[11px] font-bold rounded flex items-center gap-1 px-2"
                  onClick={() => {
                    const url = `https://${initialData?.slug}.portfolioforge.app`;
                    navigator.clipboard.writeText(url);
                    toast.success("복사되었습니다!");
                  }}
                >
                  <Copy className="w-3 h-3" />
                  복사
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-spotify-silver hover:text-white hover:bg-white/10 text-[11px] font-bold rounded flex items-center gap-1 px-2"
                  onClick={() =>
                    window.open(
                      `https://${initialData?.slug}.portfolioforge.app`,
                      "_blank",
                    )
                  }
                >
                  <ArrowUpRight className="w-3 h-3" />
                  열기
                </Button>
              </div>
            </div>
          </div>

          <CustomDomainSection />
        </div>
      </div>

      <div className="bg-spotify-dark-surface border border-white/5 rounded-[24px] p-5 shadow-spotify space-y-5 text-white">
        <div className="space-y-1">
          <h3 className="text-[16px] font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
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
                className="rounded-full bg-spotify-near-black border border-white/5 text-white focus:border-spotify-green placeholder:text-white/10 text-xs px-5 h-10"
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
                className="rounded-full bg-spotify-near-black border border-white/5 text-white focus:border-spotify-green placeholder:text-white/10 text-xs px-5 h-10"
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
                className="rounded-full bg-spotify-near-black border border-white/5 text-white focus:border-spotify-green placeholder:text-white/10 text-xs px-5 h-10"
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
            연락처 블록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
});
