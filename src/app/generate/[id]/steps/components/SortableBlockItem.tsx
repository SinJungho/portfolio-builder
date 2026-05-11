import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Settings, ArrowUp, ArrowDown, Trash2, GripVertical } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
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
} from '@/components/ui/alert-dialog';

const blockTypeLabels: Record<string, string> = {
  hero: "소개",
  project_grid: "프로젝트",
  skills: "기술 스택",
  contact: "연락처",
  blog_feed: "블로그",
};

interface SortableBlockItemProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  block: any;
  index: number;
  totalBlocks: number;
  icon: React.ReactNode;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onOpenProjectEditor: (block: any) => void;
}

export function SortableBlockItem({ 
  block, 
  index, 
  totalBlocks, 
  icon, 
  onToggle, 
  onDelete, 
  onMoveUp, 
  onMoveDown, 
  onOpenProjectEditor 
}: SortableBlockItemProps) {
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
        group flex flex-col p-5 sm:p-6 border rounded-[24px] bg-white transition-all duration-300 gap-5 relative
        ${!block.is_visible ? "opacity-40 grayscale bg-gray-50/50" : "shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"}
        ${isDragging ? "ring-2 ring-blue-500 shadow-2xl scale-[1.02]" : ""}
      `}
    >
      <div className="flex items-center gap-4 w-full min-w-0">
        {/* Drag Handle */}
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab active:cursor-grabbing p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-50 rounded"
        >
          <GripVertical className="w-5 h-5" />
        </div>

        <div 
          className={`p-3 rounded-2xl transition-colors shrink-0 ${!block.is_visible ? "bg-gray-100" : "bg-blue-50"}`}
          style={{ color: !block.is_visible ? "#ADB5BD" : "#3182F6" }}
        >
          {icon}
        </div>
        
        <div className="space-y-1 overflow-hidden min-w-0 flex-1">
          <h3 className="font-bold text-[17px] text-[#191F28] truncate">{blockTypeLabels[block.block_type] || block.block_type}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {block.is_ai_generated && (
              <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-md tracking-wider">AI Generated</span>
            )}
            {block.block_type === 'project_grid' && block.is_visible && (
              <button 
                onClick={() => onOpenProjectEditor(block)}
                className="group/edit inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-[#3182F6] text-[#3182F6] hover:text-white rounded-full text-[12px] font-bold transition-all duration-300 shadow-sm shadow-blue-500/5 active:scale-95 whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5 transition-transform group-hover/edit:rotate-45" />
                <span>프로젝트 설정</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-black/5 mt-auto ml-10">
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl overflow-hidden border border-black/5">
            <button 
              onClick={() => onMoveUp(index)} 
              disabled={index === 0} 
              className="p-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-20 transition-colors"
              title="위로 이동"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button 
              onClick={() => onMoveDown(index)} 
              disabled={index === totalBlocks - 1} 
              className="p-2.5 bg-gray-50 hover:bg-gray-100 border-l border-black/5 disabled:opacity-20 transition-colors"
              title="아래로 이동"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
          <div className="h-10 w-px bg-black/5 mx-1" />
          <div className="flex items-center px-1">
            <Switch
              checked={block.is_visible}
              onCheckedChange={() => onToggle(block.id)}
              className="data-[state=checked]:bg-[#3182F6] scale-100"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                <Trash2 className="w-5 h-5" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-[32px] border-none shadow-2xl p-8 z-50">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-[20px] font-extrabold text-[#191F28]">블록을 완전히 삭제할까요?</AlertDialogTitle>
                <AlertDialogDescription className="text-[15px] font-medium leading-relaxed text-[#4E5968]">
                  이 블록과 관련된 모든 설정이 영구적으로 삭제됩니다. 보이지 않게만 하고 싶다면 스위치를 꺼주세요.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                <AlertDialogCancel className="w-full sm:w-auto rounded-2xl h-11 border-black/5 font-bold order-2 sm:order-1">취소</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(block.id)}
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white rounded-2xl h-11 font-bold px-6 shadow-lg shadow-red-500/20 order-1 sm:order-2"
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
}
