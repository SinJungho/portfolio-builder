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
  GripVertical,
  Settings,
  Trash2,
} from "lucide-react";
import React from "react";
import { blockDisplayName } from "@/lib/block-labels";

interface SortableBlockItemProps<T = unknown> {
  block: T & {
    id: string;
    block_type: string;
    is_visible: boolean;
    is_ai_generated?: boolean;
    config?: Record<string, unknown>;
  };
  icon: React.ReactNode;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenProjectEditor: (block: T) => void;
  onFocusBlock?: (id: string) => void;
}

export const SortableBlockItem = React.memo(function SortableBlockItem<
  T = unknown,
>({
  block,
  icon,
  onToggle,
  onDelete,
  onOpenProjectEditor,
  onFocusBlock,
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
      onFocus={() => onFocusBlock?.(block.id)}
      className={`
        group flex flex-col p-5 sm:p-6 border rounded-[24px] bg-spotify-dark-surface transition-all duration-300 gap-5 relative text-white border-white/5
        ${!block.is_visible ? "opacity-40 grayscale bg-spotify-mid-dark/50" : "shadow-spotify hover:bg-spotify-mid-dark"}
        ${isDragging ? "ring-1 ring-spotify-green shadow-[0_12px_32px_rgba(30,215,96,0.2)] scale-[1.02]" : ""}
      `}
    >
      <div className="flex items-center gap-4 w-full min-w-0">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2.5 text-spotify-silver hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          aria-label="섹션 순서 변경"
          title="스페이스바와 방향키 또는 드래그로 순서 변경"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        <div
          className={`p-3 rounded-2xl transition-colors shrink-0 ${!block.is_visible ? "bg-spotify-near-black text-spotify-silver/50" : "bg-spotify-green/10 text-spotify-green"}`}
        >
          {icon}
        </div>

        <div className="space-y-1 overflow-hidden min-w-0 flex-1">
          <h3 className="font-bold text-[17px] text-white truncate">
            {blockDisplayName[block.block_type] || block.block_type}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {block.is_ai_generated && (
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-spotify-green/10 text-spotify-green rounded-md tracking-wider">
                AI 생성
              </span>
            )}
            {["project_grid", "hero", "skills", "blog_feed", "contact"].includes(block.block_type) && block.is_visible && (
              <button
                onClick={() => onOpenProjectEditor(block)}
                className="group/edit inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-spotify-green/10 hover:bg-spotify-green text-spotify-green hover:text-black rounded-full text-[12px] font-bold transition-all duration-300 active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 transition-transform group-hover/edit:rotate-45" />
                <span>
                  {block.block_type === "project_grid"
                    ? "프로젝트 설정"
                    : block.block_type === "contact"
                      ? "연락처 편집"
                      : "섹션 편집"}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 pt-5 border-t border-white/5 mt-auto ml-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-1">
            <span className="text-[12px] font-bold text-spotify-silver">표시</span>
            <Switch
              checked={block.is_visible}
              onCheckedChange={() => onToggle(block.id)}
              className="data-[state=checked]:bg-spotify-green scale-100 cursor-pointer"
              aria-label={`${blockDisplayName[block.block_type] || block.block_type} 섹션 표시`}
            />
          </div>
        </div>

        <div className="flex items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                aria-label={`${blockDisplayName[block.block_type] || block.block_type} 섹션 삭제`}
                className="p-2.5 text-spotify-silver hover:text-spotify-negative hover:bg-spotify-negative/10 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-3xl border border-white/5 bg-spotify-dark-surface shadow-spotify p-8 z-50 text-white">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-extrabold text-white">
                  섹션을 완전히 삭제할까요?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[15px] font-medium leading-relaxed text-spotify-silver font-normal">
                  이 섹션과 관련된 모든 설정이 영구적으로 삭제됩니다. 보이지
                  않게만 하고 싶다면 스위치를 꺼주세요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-6">
                <AlertDialogCancel className="w-full sm:w-auto rounded-full h-11 border-spotify-silver/40 bg-transparent text-white font-bold order-2 sm:order-1 hover:border-white transition-all cursor-pointer">
                  취소
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(block.id)}
                  className="w-full sm:w-auto !bg-spotify-negative-strong hover:!bg-spotify-negative-strong-hover text-white rounded-full h-11 font-bold px-6 order-1 sm:order-2 cursor-pointer"
                >
                  삭제
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}) as <T = unknown>(props: SortableBlockItemProps<T>) => React.ReactElement;
