"use client";

import { Block, usePortfolioStore } from "@/stores/portfolioStore";
import { type PortfolioInitialData } from "@/types/portfolio";
import { type RawProject } from "@/types/project";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import React, { useCallback, useState } from "react";
import { toast } from "sonner";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";

import DesignEditor from "@/components/features/editor/DesignEditor";
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { BlocksPanel } from "./components/BlocksPanel";
import { ContactSettingsPanel } from "./components/ContactSettingsPanel";
import { DomainSettingsPanel } from "./components/DomainSettingsPanel";
import { ProjectSelectionModal } from "./components/ProjectSelectionModal";

type MobileTab = "blocks" | "settings";

interface AdjustStepProps {
  initialData?: PortfolioInitialData;
}

export default function AdjustStep({
  initialData,
}: AdjustStepProps): React.ReactElement {
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

  const [isEditingProjects, setIsEditingProjects] = useState<boolean>(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >({});
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: rawProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(responseErrorMessage(payload, "PROJECT_LIST_FAILED"));
      return payload;
    },
    enabled: init,
  });

  // 마운트 시 스토어 상태를 동기화한다.
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

  // 5px 이상 움직였을 때만 드래그를 시작한다.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = blocks.findIndex((b) => b.id === active.id);
        const newIndex = blocks.findIndex((b) => b.id === over.id);
        const newBlocks = arrayMove(blocks, oldIndex, newIndex);
        newBlocks.forEach((b, i) => (b.position = i));
        reorderBlocks(newBlocks);
      }
    },
    [blocks, reorderBlocks],
  );

  const contactBlock = blocks.find((b) => b.block_type === "contact");

  const handleOptionalChange = useCallback(
    (field: string, value: string) => {
      if (!contactBlock) return;
      updateOptionalField(contactBlock.id, { [field]: value })
        .then(() => {
          toast.success("연락처 정보가 저장되었습니다.");
        })
        .catch((err: Error) => {
          toast.error(
            err.message ||
              errorMessage("CONTACT_SAVE_FAILED"),
          );
        });
    },
    [contactBlock, updateOptionalField],
  );

  const openProjectEditor = useCallback((block: Block) => {
    setEditingBlockId(block.id);
    setTempSelectedIds((block.config.project_ids as string[]) || []);
    setTempCustomDescriptions(
      (block.config.custom_descriptions as Record<string, string>) || {},
    );
    setIsEditingProjects(true);
  }, []);

  const saveProjectChanges = useCallback(() => {
    if (!editingBlockId) return;
    const block = blocks.find((b) => b.id === editingBlockId);
    if (block) {
      updateBlockConfig(editingBlockId, {
        ...block.config,
        project_ids: tempSelectedIds,
        custom_descriptions: tempCustomDescriptions,
      })
        .then(() => {
          setIsEditingProjects(false);
          setEditingBlockId(null);
          toast.success("대표 프로젝트 설정이 저장되었습니다.");
        })
        .catch((err: Error) => {
          toast.error(
            err.message ||
              errorMessage("PROJECT_SAVE_FAILED"),
          );
        });
    }
  }, [
    editingBlockId,
    blocks,
    tempSelectedIds,
    tempCustomDescriptions,
    updateBlockConfig,
  ]);

  const toggleTempProject = useCallback((id: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleDescriptionChange = useCallback(
    (id: string, value: string): void => {
      setTempCustomDescriptions((prev) => ({
        ...prev,
        [id]: value,
      }));
    },
    [],
  );

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

  const BlocksPanelComponent = (
    <BlocksPanel
      blocks={blocks}
      isSaving={isSaving}
      sensors={sensors}
      handleDragEnd={handleDragEnd}
      toggleBlock={toggleBlock}
      deleteBlock={deleteBlock}
      openProjectEditor={openProjectEditor}
      addBlock={addBlock}
    />
  );

  const SettingsPanelComponent = (
    <div className="space-y-6">
      <div className="bg-spotify-dark-surface border border-white/5 rounded-lg p-5 sm:p-6 md:p-8 shadow-spotify text-white">
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
    <div className="relative min-h-[100dvh] bg-spotify-near-black pb-24 text-white">
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-7xl pt-4 px-4 gap-6 md:gap-10 mx-auto">
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

        <div className="hidden lg:grid lg:grid-cols-2 gap-10">
          <div className="space-y-6">{BlocksPanelComponent}</div>
          <div className="space-y-6">{SettingsPanelComponent}</div>
        </div>

        <div className="lg:hidden">
          {mobileTab === "blocks"
            ? BlocksPanelComponent
            : SettingsPanelComponent}
        </div>
      </div>

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
