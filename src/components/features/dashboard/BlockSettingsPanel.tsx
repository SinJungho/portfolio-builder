import { useState } from "react";
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PortfolioBlock } from "@prisma/client";
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  User, 
  LayoutGrid, 
  Zap, 
  Rss, 
  Mail,
  Info,
  Settings2,
  RefreshCw,
  Link2
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface BlockSettingsPanelProps {
  blocks: PortfolioBlock[];
  onBlocksChange: (newBlocks: PortfolioBlock[]) => void;
}

const BLOCK_ICONS: Record<string, any> = {
  hero: User,
  project_grid: LayoutGrid,
  skills: Zap,
  blog_feed: Rss,
  contact: Mail,
};

const BLOCK_LABELS: Record<string, string> = {
  hero: "자기소개 (Hero)",
  project_grid: "프로젝트 그리드",
  skills: "기술 스택",
  blog_feed: "블로그 피드",
  contact: "연락처 (Contact)",
};

export default function BlockSettingsPanel({ blocks, onBlocksChange }: BlockSettingsPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      onBlocksChange(arrayMove(blocks, oldIndex, newIndex));
    }
  };

  const toggleVisibility = (blockId: string) => {
    const newBlocks = blocks.map((b) => 
      b.id === blockId ? { ...b, is_visible: !b.is_visible } : b
    );
    onBlocksChange(newBlocks);
  };

  const updateBlockConfig = (blockId: string, newConfig: any) => {
    const newBlocks = blocks.map((b) => 
      b.id === blockId ? { ...b, config: { ...(b.config as object), ...newConfig } } : b
    );
    onBlocksChange(newBlocks);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-1.5">
        <h3 className="text-[18px] font-extrabold text-[#191F28] tracking-tight">레이아웃 관리</h3>
        <p className="text-[13px] font-medium text-[#8B95A1] leading-relaxed">
          섹션의 순서를 바꾸거나, 노출 여부를 선택하세요.
        </p>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {blocks.map((block) => (
              <SortableBlockItem 
                key={block.id} 
                block={block} 
                onToggle={() => toggleVisibility(block.id)} 
                onConfigChange={(config) => updateBlockConfig(block.id, config)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className="bg-blue-50/50 rounded-2xl p-4 flex gap-3 border border-blue-100/50 mt-4">
         <Info className="w-4.5 h-4.5 text-[#3182F6] shrink-0 mt-0.5" />
         <p className="text-[12px] font-bold text-[#3182F6] leading-relaxed">
           상단 카드를 잡고 위아래로 끌어다 놓으세요. 바뀐 순서는 우측 미리보기에 실시간으로 반영됩니다.
         </p>
      </div>
    </div>
  );
}

function SortableBlockItem({ 
  block, 
  onToggle,
  onConfigChange 
}: { 
  block: PortfolioBlock; 
  onToggle: () => void;
  onConfigChange: (config: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const [isExpanded, setIsExpanded] = useState(false);
  const [blogUrl, setBlogUrl] = useState((block.config as any)?.blog_url || "");
  const [isSyncing, setIsSyncing] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = BLOCK_ICONS[block.block_type] || Info;

  const handleBlogSync = async () => {
    if (!blogUrl) return toast.error("블로그 주소를 입력해 주세요.");
    
    try {
      setIsSyncing(true);
      const res = await fetch("/api/integrations/blog/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url: blogUrl, 
          portfolio_id: block.portfolio_id, 
          block_id: block.id 
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "동기화에 실패했습니다.");
      }

      const data = await res.json();
      onConfigChange({ 
        blog_url: blogUrl, 
        integration_provider: data.provider,
        rss_url: data.rssUrl 
      });
      toast.success(`${data.count}개의 포스트를 성공적으로 불러왔습니다!`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col bg-white border border-black/5 rounded-2xl transition-all duration-300 overflow-hidden",
        isDragging ? "shadow-2xl scale-[1.02] border-[#3182F6]/30 z-50 opacity-90" : "shadow-sm hover:border-black/10",
        !block.is_visible && "opacity-50 grayscale-[0.5]"
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-300 hover:text-gray-500 transition-colors cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </button>

        {/* Block Info */}
        <div className="flex-1 flex items-center gap-3 min-w-0">
          <div className={cn(
            "p-2 rounded-xl shrink-0 transition-colors",
            block.is_visible ? "bg-gray-50 text-gray-700" : "bg-gray-100 text-gray-400"
          )}>
            <Icon className="w-4.5 h-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-extrabold text-[#191F28] truncate">
              {BLOCK_LABELS[block.block_type] || block.block_type}
            </p>
            <p className="text-[11px] font-bold text-gray-400 tracking-tight">블록 섹션</p>
          </div>
        </div>

        {/* Settings Button */}
        {block.block_type === "blog_feed" && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "p-2 rounded-xl transition-all",
              isExpanded ? "bg-blue-50 text-[#3182F6]" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"
            )}
          >
            <Settings2 className="w-4.5 h-4.5" />
          </button>
        )}

        {/* Visibility Toggle */}
        <div className="flex items-center gap-2 pr-1">
          {block.is_visible ? (
            <Eye className="w-3.5 h-3.5 text-gray-300" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-gray-400" />
          )}
          <Switch 
            checked={block.is_visible} 
            onCheckedChange={onToggle}
            className="scale-90" 
          />
        </div>
      </div>

      {/* Expandable Settings for Blog */}
      {isExpanded && block.block_type === "blog_feed" && (
        <div className="px-4 pb-4 pt-1 animate-in slide-in-from-top-2 duration-300">
           <div className="bg-gray-50 rounded-xl p-4 space-y-3.5 border border-black/3">
              <div className="flex items-center gap-2">
                 <Link2 className="w-3.5 h-3.5 text-[#3182F6]" />
                 <span className="text-[12px] font-bold text-[#4E5968]">블로그 연동 전문 설정</span>
              </div>
              
              <div className="flex gap-2">
                 <Input 
                   placeholder="Velog 또는 Tistory 주소 (예: velog.io/@username)"
                   value={blogUrl}
                   onChange={(e) => setBlogUrl(e.target.value)}
                   className="h-10 text-[13px] font-bold rounded-lg bg-white border-black/5 shadow-sm"
                 />
                 <Button 
                   size="sm"
                   disabled={isSyncing}
                   onClick={handleBlogSync}
                   className="h-10 bg-[#3182F6] hover:brightness-110 text-white rounded-lg px-4 font-bold shrink-0 shadow-md shadow-blue-500/10"
                 >
                   {isSyncing ? (
                     <RefreshCw className="w-4 h-4 animate-spin" />
                   ) : (
                     "동기화"
                   )}
                 </Button>
              </div>
              <p className="text-[11px] font-medium text-gray-400 leading-tight">
                * 주소 입력 후 동기화를 누르면 마지막 발행물 6개를 자동으로 수집합니다.
              </p>
           </div>
        </div>
      )}
    </div>
  );
}
