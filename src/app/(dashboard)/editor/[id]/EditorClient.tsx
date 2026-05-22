"use client";

import { useEffect, useState } from "react";
import { type Block, usePortfolioStore } from "@/stores/portfolioStore";
import { 
  Loader2, 
  User, 
  Grid, 
  BarChart, 
  Mail, 
  Rss, 
  Check, 
  Sparkles, 
  Search,
  Star,
  GitFork,
  X,
  Plus,
  Globe,
  Copy,
  ArrowUpRight,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import Link from "next/link";

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
} from "@dnd-kit/sortable";
import { SortableBlockItem } from "@/app/generate/[id]/steps/components/SortableBlockItem";
import DesignEditor from "@/components/features/editor/DesignEditor";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
import PortfolioPreview from "@/preview/PortfolioPreview";

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

interface RawProject {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
}

type SidebarTab = "blocks" | "settings";

export interface EditorInitialData {
  portfolioId: string;
  slug: string | null;
  customDomain: string | null;
  blocks: Block[];
  theme: string;
  isPublished: boolean;
  publishedUrl: string | null;
}

export default function EditorClient({ initialData }: { initialData: EditorInitialData }) {
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
    customDomain,
    setCustomDomain,
  } = usePortfolioStore();
  
  const [init, setInit] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");

  
  // Project selection state
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState("");

  const { data: rawProjects } = useQuery<RawProject[]>({
    queryKey: ["raw-projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects/raw");
      if (!res.ok) throw new Error("Failed to fetch projects");
      return res.json();
    },
    enabled: init,
  });

  useEffect(() => {
    if (initialData && !init) {
      initialize({
        ...initialData,
        blocks: initialData.blocks.map((b) => ({
          ...b,
          block_type: b.block_type,
        })),
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInit(true);
    }
  }, [initialData, init, initialize]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    newBlocks.forEach((b: Block, i: number) => (b.position = i));
    reorderBlocks(newBlocks);
  };

  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    newBlocks.forEach((b: Block, i: number) => (b.position = i));
    reorderBlocks(newBlocks);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
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

  const openProjectEditor = (block: Block) => {
    setEditingBlockId(block.id);
    setTempSelectedIds((block.config.project_ids as string[]) || []);
    setTempCustomDescriptions((block.config.custom_descriptions as Record<string, string>) || {});
    setIsEditingProjects(true);
  };

  const saveProjectChanges = () => {
    if (!editingBlockId) return;
    const block = blocks.find((b: Block) => b.id === editingBlockId);
    if (block) {
      updateBlockConfig(editingBlockId, {
        ...block.config,
        project_ids: tempSelectedIds,
        custom_descriptions: tempCustomDescriptions
      }).then(() => {
        setIsEditingProjects(false);
        setEditingBlockId(null);
        toast.success("대표 리포지토리 설정이 업데이트되었습니다.");
      });
    }
  };

  const filteredProjects = rawProjects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTempProject = (id: string) => {
    setTempSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (!init) {
    return <div className="flex justify-center p-12 h-screen items-center"><Loader2 className="animate-spin w-8 h-8 text-[#3182F6]" /></div>;
  }

  const BlocksPanel = (
    <div className="space-y-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[17px] font-extrabold tracking-tight text-[#191F28] flex items-center gap-2">
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
            {blocks.map((block, index) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                index={index}
                totalBlocks={blocks.length}
                icon={blockTypeIcons[block.block_type] || <Grid className="w-5 h-5" />}
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
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-100 rounded-[20px] gap-3">
            <div className="p-3 bg-gray-50 rounded-full text-gray-300">
              <Grid className="w-6 h-6" />
            </div>
            <p className="text-gray-400 font-bold text-[14px]">추가된 블록이 없습니다.</p>
        </div>
      )}
      
      <div className="pt-6 border-t border-black/5 mt-6">
        <div className="flex flex-col gap-1 mb-4 px-1">
          <h4 className="text-[15px] font-bold text-[#191F28]">새로운 블록 추가</h4>
          <p className="text-[12px] text-gray-400 font-medium">내 포트폴리오를 더 풍성하게 만들어보세요.</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(blockTypeLabels).map(type => {
            const isUnique = type === 'hero' || type === 'contact';
            const alreadyExists = isUnique && blocks.some((b: Block) => b.block_type === type);
            
            return (
              <button
                key={type}
                onClick={() => addBlock(type)}
                disabled={isSaving || alreadyExists}
                className={`
                  flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-bold transition-all border
                  ${alreadyExists 
                    ? "bg-gray-50 border-black/3 text-gray-300 cursor-not-allowed" 
                    : "bg-white border-black/5 text-[#4E5968] hover:border-[#3182F6] hover:text-[#3182F6] hover:shadow-sm active:scale-95"
                  }
                `}
              >
                {alreadyExists ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                {blockTypeLabels[type]}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  const SettingsPanel = (
    <div className="space-y-6">
      <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-sm">
        <DesignEditor />
      </div>
      <div className="bg-[#121212] border border-white/5 rounded-[24px] p-6 shadow-xl text-white space-y-6">
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
            <Label className="text-[10px] font-black uppercase text-spotify-silver tracking-wider">기본 무료 제공 주소</Label>
            <div className="flex flex-col gap-2 p-3 bg-white/5 border border-white/5 rounded-xl">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-spotify-green shrink-0" />
                <span className="text-[13px] font-bold text-white font-mono truncate">{initialData?.slug}.portfolioforge.app</span>
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
                  onClick={() => window.open(`https://${initialData?.slug}.portfolioforge.app`, "_blank")}
                >
                  <ArrowUpRight className="w-3 h-3" />
                  열기
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-white/5">
            <Label htmlFor="custom-domain" className="text-[10px] font-black uppercase text-spotify-silver tracking-wider">
              커스텀 도메인 연결 <span className="text-[9px] text-spotify-silver/50 lowercase font-medium">(optional)</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="custom-domain"
                placeholder="www.yourdomain.com"
                className="rounded-lg h-9 bg-spotify-near-black border-white/5 focus:border-spotify-green text-white placeholder:text-spotify-silver/20 text-xs"
                defaultValue={customDomain || ""}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const val = e.currentTarget.value.trim();
                    setCustomDomain(val || null)
                      .then(() => toast.success("도메인이 업데이트되었습니다."))
                      .catch((err) => toast.error(err.message));
                  }
                }}
              />
              <Button
                className="btn-pill-primary h-9 px-4 text-xs font-bold"
                onClick={() => {
                  const input = document.getElementById("custom-domain") as HTMLInputElement;
                  const val = input.value.trim();
                  setCustomDomain(val || null)
                    .then(() => toast.success("도메인이 업데이트되었습니다."))
                    .catch((err) => toast.error(err.message));
                }}
              >
                연결
              </Button>
            </div>
          </div>

          {customDomain && (
            <div className="p-3 bg-spotify-green/5 border border-spotify-green/20 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-spotify-green flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-spotify-green rounded-full animate-pulse" />
                  연결 상태
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-spotify-green hover:text-white hover:bg-spotify-green/10 text-[10px] font-bold rounded px-2"
                  onClick={async () => {
                    const res = await fetch(`/api/domains/${customDomain}`);
                    const data = await res.json();
                    if (data.configured) toast.success("연결 완료되었습니다!");
                    else toast.error("DNS 설정을 확인하고 있습니다.");
                  }}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  새로고침
                </Button>
              </div>
              <div className="text-[11px] text-spotify-silver font-medium">
                <strong className="text-white">{customDomain}</strong> 등록됨 (DNS 전파 대기 중)
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-black/5 rounded-[24px] p-5 shadow-sm space-y-5">
        <div className="space-y-1">
          <h3 className="text-[16px] font-extrabold text-[#191F28] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            연락처 보완
          </h3>
        </div>
        {contactBlock ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                className="rounded-lg border-black/5 bg-gray-50/50 h-10 text-sm"
                defaultValue={(contactBlock.config?.email as string) || ""}
                onBlur={(e) => handleOptionalChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedin" className="text-xs font-bold">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="rounded-lg border-black/5 bg-gray-50/50 h-10 text-sm"
                defaultValue={(contactBlock.config?.linkedin_url as string) || ""}
                onBlur={(e) => handleOptionalChange("linkedin_url", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-bold">개인 웹사이트</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                className="rounded-lg border-black/5 bg-gray-50/50 h-10 text-sm"
                defaultValue={(contactBlock.config?.website_url as string) || ""}
                onBlur={(e) => handleOptionalChange("website_url", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="text-[12px] text-gray-400 bg-gray-50 p-4 rounded-xl text-center font-medium">
            연락처 블록이 없습니다.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen w-full bg-[#FAFAFA] overflow-hidden">
      {/* Top Header */}
      <header className="h-14 border-b border-black/5 bg-white flex items-center justify-between px-6 shrink-0 z-20">
        <Link href="/dashboard" className="flex items-center gap-2 text-[14px] font-bold text-gray-500 hover:text-[#191F28] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          대시보드로 돌아가기
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[12px] font-bold transition-all">
            {isSaving ? (
              <span className="text-blue-500 flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> 자동 저장 중...</span>
            ) : (
              <span className="text-emerald-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" /> 모든 변경사항 자동 저장됨</span>
            )}
          </div>
        </div>
      </header>

      {/* Editor Body */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar (Settings) */}
        <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 border-r border-black/5 bg-white flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <div className="flex p-3 gap-1 bg-gray-50 border-b border-black/5 shrink-0">
            <button
              onClick={() => setSidebarTab("blocks")}
              className={`flex-1 text-[13px] font-bold py-2.5 rounded-lg transition-all ${
                sidebarTab === "blocks" ? "bg-white text-[#3182F6] shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              블록 구성
            </button>
            <button
              onClick={() => setSidebarTab("settings")}
              className={`flex-1 text-[13px] font-bold py-2.5 rounded-lg transition-all ${
                sidebarTab === "settings" ? "bg-white text-[#3182F6] shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              }`}
            >
              스타일 & 설정
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-[#FAFAFA]">
            {sidebarTab === "blocks" ? BlocksPanel : SettingsPanel}
          </div>
        </aside>

        {/* Right Sidebar (Live Preview) */}
        <main className="hidden md:flex flex-1 bg-gray-100/50 overflow-y-auto relative items-start justify-center pt-8 pb-32">
          {/* Subtle grid background for preview area */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)]
              bg-size-[40px_40px]
            "
          />
          <div className="w-full max-w-[1000px] bg-white rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-2xl shadow-black/5 border border-black/10 mx-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Browser mock header */}
            <div className="h-10 bg-gray-50 border-b border-black/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto bg-white border border-black/5 rounded-md px-24 py-1 text-[10px] text-gray-400 font-mono flex items-center gap-2 shadow-sm">
                <Globe className="w-3 h-3 text-gray-300" />
                {initialData?.slug}.portfolioforge.app
              </div>
            </div>
            
            {/* Live Portfolio Preview Mount */}
            <div className="w-full h-full min-h-[800px] overflow-hidden bg-white">
              <PortfolioPreview 
                blocks={blocks}
                theme={theme}
                designTokens={designTokens}
                slug={initialData?.slug || undefined}
                portfolioId={initialData?.portfolioId}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Project Selection Modal (Copied from AdjustStep) */}
      {isEditingProjects && (
        <div className="fixed inset-0 z-50 bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-black/5 sticky top-0 bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsEditingProjects(false)}
                className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-[#191F28]" />
              </button>
              <h3 className="text-[18px] font-bold text-[#191F28]">대표 리포지토리 선택 ({tempSelectedIds.length})</h3>
            </div>
            <Button 
              className="bg-[#3182F6] hover:brightness-110 rounded-xl px-6 font-bold"
              onClick={saveProjectChanges}
              disabled={isSaving}
            >
              적용하기
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <Input 
                  placeholder="리포지토리 검색..." 
                  className="pl-12 h-14 bg-gray-50 border-none rounded-[20px] text-[16px] focus:ring-2 focus:ring-blue-100 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects?.map((project) => (
                <Card 
                  key={project.id}
                  onClick={() => toggleTempProject(project.id)}
                  className={`
                    relative p-6 cursor-pointer rounded-[28px] border transition-all duration-300
                    ${tempSelectedIds.includes(project.id) 
                      ? "border-[#3182F6] bg-blue-50/20 ring-1 ring-[#3182F6]/30" 
                      : "border-black/5 bg-white hover:border-gray-200 hover:shadow-xl hover:shadow-black/5"}
                  `}
                >
                  <div className="absolute top-5 right-5 h-6 w-6 rounded-full border border-black/5 bg-gray-50 flex items-center justify-center transition-colors">
                    {tempSelectedIds.includes(project.id) && (
                      <div className="h-full w-full rounded-full bg-[#3182F6] flex items-center justify-center animate-in zoom-in-50 duration-200">
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="pr-10">
                      <h4 className="font-extrabold text-[17px] text-[#191F28] line-clamp-1">{project.name}</h4>
                      <p className="text-[14px] text-[#4E5968] line-clamp-2 mt-2 leading-relaxed min-h-[40px]">
                        {project.description || "설명이 없는 프로젝트입니다."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.language && (
                        <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                          {project.language}
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-[12px] text-gray-400 font-bold">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5" />
                          {project.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5" />
                          {project.forks_count}
                        </div>
                      </div>
                    </div>

                    {tempSelectedIds.includes(project.id) && (
                      <div 
                        className="pt-4 border-t border-black/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Label className="text-[11px] font-bold text-blue-500 uppercase tracking-wider flex items-center gap-2">
                          포트폴리오용 프로젝트 소개
                          <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[10px]">Markdown</span>
                        </Label>
                        
                        <MarkdownEditor 
                          value={tempCustomDescriptions[project.id] || project.description || ""}
                          onChange={(val) => {
                            setTempCustomDescriptions(prev => ({
                              ...prev,
                              [project.id]: val
                            }));
                          }}
                        />
                        
                        <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                          README 요약 대신 이 내용이 우선적으로 노출됩니다. 직접 작성하거나 기존 마크다운 파일을 불러올 수 있습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {filteredProjects?.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-gray-400 font-bold text-lg">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
