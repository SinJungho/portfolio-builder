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
import { Switch } from "@/components/ui/switch";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowDown,
  ArrowUp,
  GripVertical,
  Settings,
  Trash2,
} from "lucide-react";
import React from "react";

const blockTypeLabels: Record<string, string> = {
  hero: "소개",
  project_grid: "프로젝트",
  skills: "기술 스택",
  contact: "연락처",
  blog_feed: "블로그",
};

interface SortableBlockItemProps<T = unknown> {
  block: T & {
    id: string;
    block_type: string;
    is_visible: boolean;
    is_ai_generated?: boolean;
    config?: Record<string, unknown>;
  };
  index: number;
  totalBlocks: number;
  icon: React.ReactNode;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onOpenProjectEditor: (block: T) => void;
}

export const SortableBlockItem = React.memo(function SortableBlockItem<
  T = unknown,
>({
  block,
  index,
  totalBlocks,
  icon,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
  onOpenProjectEditor,
}: SortableBlockItemProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group flex flex-col p-5 sm:p-6 border rounded-[24px] bg-spotify-dark-surface transition-all duration-300 gap-5 relative text-white border-white/5
        ${!block.is_visible ? "opacity-40 grayscale bg-spotify-mid-dark/50" : "shadow-spotify hover:bg-spotify-mid-dark"}
        ${isDragging ? "ring-1 ring-spotify-green shadow-[0_12px_32px_rgba(30,215,96,0.2)] scale-[1.02]" : ""}
      `}
    >
      <div className="flex items-center gap-4 w-full min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-spotify-silver hover:text-white hover:bg-white/5 rounded transition-colors"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div
          className={`p-3 rounded-2xl transition-colors shrink-0 ${!block.is_visible ? "bg-spotify-near-black text-spotify-silver/50" : "bg-spotify-green/10 text-spotify-green"}`}
        >
          {icon}
        </div>

        <div className="space-y-1 overflow-hidden min-w-0 flex-1">
          <h3 className="font-bold text-[17px] text-white truncate">
            {blockTypeLabels[block.block_type] || block.block_type}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {block.is_ai_generated && (
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-spotify-green/10 text-spotify-green rounded-md tracking-wider">
                AI 생성
              </span>
            )}
            {block.block_type === "project_grid" && block.is_visible && (
              <button
                onClick={() => onOpenProjectEditor(block)}
                className="group/edit inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-spotify-green/10 hover:bg-spotify-green text-spotify-green hover:text-black rounded-full text-[12px] font-bold transition-all duration-300 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 transition-transform group-hover/edit:rotate-45" />
                <span>프로젝트 설정</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-white/5 mt-auto ml-10">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-white/5">
            <button
              onClick={() => onMoveUp(index)}
              disabled={index === 0}
              className="p-2.5 bg-spotify-near-black hover:bg-white/5 text-spotify-silver hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
              title="위로 이동"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => onMoveDown(index)}
              disabled={index === totalBlocks - 1}
              className="p-2.5 bg-spotify-near-black hover:bg-white/5 text-spotify-silver hover:text-white border-l border-white/5 disabled:opacity-20 transition-colors cursor-pointer"
              title="아래로 이동"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          <div className="h-10 w-px bg-white/5 mx-1" />
          <div className="flex items-center px-1">
            <Switch
              checked={block.is_visible}
              onCheckedChange={() => onToggle(block.id)}
              className="data-[state=checked]:bg-spotify-green scale-100 cursor-pointer"
            />
          </div>
        </div>

        <div className="flex items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2.5 text-spotify-silver hover:text-spotify-negative hover:bg-spotify-negative/10 rounded-xl transition-all cursor-pointer">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-[32px] border border-white/5 bg-spotify-dark-surface shadow-spotify p-8 z-50 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-extrabold text-white">
                  블록을 완전히 삭제할까요?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[15px] font-medium leading-relaxed text-spotify-silver font-normal">
                  이 블록과 관련된 모든 설정이 영구적으로 삭제됩니다. 보이지
                  않게만 하고 싶다면 스위치를 꺼주세요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6">
                <AlertDialogCancel className="w-full sm:w-auto rounded-full h-11 border-spotify-silver/40 bg-transparent text-white font-bold order-2 sm:order-1 hover:border-white transition-all cursor-pointer">
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(block.id)}
                  className="w-full sm:w-auto bg-spotify-negative hover:bg-spotify-negative/80 text-white rounded-full h-11 font-bold px-6 shadow-lg shadow-spotify-negative/20 order-1 sm:order-2 cursor-pointer"
                >
                  네, 삭제할게요
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}) as <T = unknown>(props: SortableBlockItemProps<T>) => React.ReactElement;
