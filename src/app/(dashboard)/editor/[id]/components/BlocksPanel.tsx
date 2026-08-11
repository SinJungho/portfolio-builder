"use client";

import React from "react";
import { type Block } from "@/stores/portfolioStore";
import { errorMessage } from "@/lib/api/errors";
import { blockDisplayName, blockDescription } from "@/lib/block-labels";
import { BarChart, Check, Grid, Mail, Plus, Rss, User } from "lucide-react";
import { toast } from "sonner";
import { SortableBlockItem } from "@/app/generate/[id]/steps/components/SortableBlockItem";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  type SensorDescriptor,
  type SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const blockTypeIcons: Record<string, React.ReactNode> = {
  hero: <User className="w-5 h-5 text-current" />,
  project_grid: <Grid className="w-5 h-5 text-current" />,
  skills: <BarChart className="w-5 h-5 text-current" />,
  contact: <Mail className="w-5 h-5 text-current" />,
  blog_feed: <Rss className="w-5 h-5 text-current" />,
};

interface BlocksPanelProps {
  blocks: Block[];
  sensors: SensorDescriptor<SensorOptions>[];
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
      toast.error(errorMessage("SECTION_VISIBILITY_SAVE_FAILED"));
    }
  };

  const handleDelete = async (blockId: string) => {
    try {
      await deleteBlock(blockId);
      toast.success("콘텐츠를 삭제했어요.");
    } catch {
      toast.error(errorMessage("SECTION_DELETE_FAILED"));
    }
  };

  const handleAdd = async (blockType: string) => {
    try {
      await addBlock(blockType);
    } catch {
      toast.error(errorMessage("SECTION_ADD_FAILED"));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[17px] font-bold tracking-tight text-white flex items-center gap-2">
          콘텐츠 순서 및 표시 설정
        </h2>
      </div>
      <p className="px-1 text-[12px] font-medium leading-relaxed text-spotify-silver">
        순서 변경 아이콘을 선택한 뒤 스페이스바와 방향키로도 콘텐츠 순서를 바꿀 수 있어요.
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
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-white/5 bg-spotify-near-black/20 rounded-lg gap-3">
          <div className="p-3 bg-white/5 rounded-full text-spotify-silver">
            <Grid className="w-6 h-6" />
          </div>
          <p className="text-spotify-silver font-bold text-[14px]">
            아직 추가된 콘텐츠가 없어요.
          </p>
          <p className="max-w-[240px] text-center text-[12px] leading-relaxed text-spotify-silver">
            빠르게 시작하려면 소개, 대표 작업, 연락처 세 가지만 추가하면 돼요.
          </p>
        </div>
      )}

      <div className="pt-6 border-t border-white/5 mt-6">
        <div className="flex flex-col gap-1 mb-4 px-1">
          <h3 className="text-[15px] font-bold text-white">새 콘텐츠 추가</h3>
          <p className="text-[12px] text-spotify-silver font-medium">
            채용 담당자가 먼저 확인할 정보부터 채워보세요.
          </p>
        </div>
        <div className="space-y-5">
          {[
            { label: "먼저 추천해요", types: ["hero", "project_grid", "contact"] },
            { label: "필요할 때 추가해요", types: ["skills", "blog_feed"] },
          ].map(({ label, types }) => (
            <div key={label} className="space-y-2">
              <h4 className="px-1 text-[11px] font-bold text-spotify-silver">{label}</h4>
              <div className="grid grid-cols-2 gap-2">
                {types.map((type) => {
                  const isUnique = type === "hero" || type === "contact";
                  const alreadyExists = isUnique && blocks.some((b: Block) => b.block_type === type);

                  return (
                    <button
                      key={type}
                      onClick={() => void handleAdd(type)}
                      disabled={isSaving || alreadyExists}
                      className={`flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left transition-all ${
                        alreadyExists
                          ? "cursor-not-allowed border-white/5 bg-spotify-near-black text-spotify-silver/50"
                          : "group cursor-pointer border-white/5 bg-spotify-near-black text-white hover:border-spotify-green hover:bg-spotify-mid-dark active:scale-95"
                      }`}
                      type="button"
                    >
                      <span className={`flex items-center gap-2 text-[12px] font-bold ${alreadyExists ? "" : "group-hover:text-spotify-green"}`}>
                        {alreadyExists ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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
          ))}
        </div>
      </div>
    </div>
  );
});

export default BlocksPanel;
