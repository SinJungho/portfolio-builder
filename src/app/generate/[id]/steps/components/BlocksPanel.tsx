"use client";

import { Block } from "@/stores/portfolioStore";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  SensorDescriptor,
  SensorOptions,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  BarChart,
  Check,
  Grid,
  Loader2,
  Mail,
  Plus,
  Rss,
  User,
} from "lucide-react";
import React from "react";
import { SortableBlockItem } from "./SortableBlockItem";

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

interface BlocksPanelProps {
  blocks: Block[];
  isSaving: boolean;
  sensors: SensorDescriptor<SensorOptions>[];
  handleDragEnd: (event: DragEndEvent) => void;
  toggleBlock: (id: string) => void;
  deleteBlock: (id: string) => void;
  openProjectEditor: (block: Block) => void;
  addBlock: (type: string) => void;
}

export const BlocksPanel = React.memo(function BlocksPanel({
  blocks,
  isSaving,
  sensors,
  handleDragEnd,
  toggleBlock,
  deleteBlock,
  openProjectEditor,
  addBlock,
}: BlocksPanelProps): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-spotify space-y-6 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-3">
            블록 구성
            {isSaving && (
              <Loader2 className="inline w-5 h-5 animate-spin text-spotify-green" />
            )}
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
              {blocks.map((block: Block) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  icon={
                    blockTypeIcons[block.block_type] || (
                      <Grid className="w-6 h-6" />
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
          <div className="flex flex-col items-center justify-center p-12 border border-white/5 bg-spotify-mid-dark/50 rounded-[32px] gap-4">
            <div className="p-4 bg-spotify-mid-dark rounded-full text-spotify-silver">
              <Grid className="w-8 h-8" />
            </div>
            <p className="text-spotify-silver font-bold text-sm">
              추가된 블록이 없습니다.
            </p>
          </div>
        )}

        <div className="pt-6 border-t border-white/5 mt-6 font-normal">
          <div className="flex flex-col gap-1 mb-4">
            <h4 className="text-[15px] font-bold text-white">
              새로운 블록 추가
            </h4>
            <p className="text-[12px] text-spotify-silver font-medium">
              내 포트폴리오를 더 풍성하게 만들어보세요.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.keys(blockTypeLabels).map((type: string) => {
              /* 소개(hero) 및 연락처(contact) 블록은 포트폴리오당 1개만 생성하도록 중복 제한 */
              const isUnique: boolean = type === "hero" || type === "contact";
              const alreadyExists: boolean =
                isUnique && blocks.some((b: Block) => b.block_type === type);

              return (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  disabled={isSaving || alreadyExists}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-bold transition-all border cursor-pointer
                    ${
                      alreadyExists
                        ? "bg-spotify-mid-dark border-white/5 text-spotify-silver/30 cursor-not-allowed"
                        : "bg-spotify-mid-dark border-white/5 text-spotify-silver hover:border-spotify-green hover:text-white hover:shadow-sm active:scale-95"
                    }
                  `}
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
    </div>
  );
});
