"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  GitFork,
  Globe,
  Grid,
  Loader2,
  Mail,
  Plus,
  Rss,
  Search,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import CustomDomainSection from "./components/CustomDomainSection";

import { SortableBlockItem } from "@/app/generate/[id]/steps/components/SortableBlockItem";
import DesignEditor from "@/components/features/editor/DesignEditor";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
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

export default function EditorClient({
  initialData,
}: {
  initialData: EditorInitialData;
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

  const [init] = useState(() => {
    initialize({
      ...initialData,
      blocks: initialData.blocks.map((b: Block) => ({
        ...b,
        block_type: b.block_type,
      })),
    });
    return true;
  });
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("blocks");

  // 프로젝트 선택 상태
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
  const [tempCustomDescriptions, setTempCustomDescriptions] = useState<
    Record<string, string>
  >({});
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

  const openProjectEditor = (block: Block) => {
    setEditingBlockId(block.id);
    setTempSelectedIds((block.config.project_ids as string[]) || []);
    setTempCustomDescriptions(
      (block.config.custom_descriptions as Record<string, string>) || {},
    );
    setIsEditingProjects(true);
  };

  const saveProjectChanges = () => {
    if (!editingBlockId) return;
    const block = blocks.find((b: Block) => b.id === editingBlockId);
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
  };

  const filteredProjects = rawProjects?.filter(
    (p: RawProject) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTempProject = (id: string) => {
    setTempSelectedIds((prevIds: string[]) =>
      prevIds.includes(id) ? prevIds.filter((i: string) => i !== id) : [...prevIds, id],
    );
  };

  if (!init) {
    return (
      <div className="flex justify-center p-12 h-screen items-center bg-spotify-near-black">
        <Loader2 className="animate-spin w-8 h-8 text-spotify-green" />
      </div>
    );
  }

  const BlocksPanel = (
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

  const SettingsPanel = (
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
                onBlur={(e) => handleOptionalChange("email", e.target.value)}
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
                onBlur={(e) =>
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
                onBlur={(e) =>
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

  return (
    <div className="flex flex-col h-screen w-full bg-spotify-near-black overflow-hidden text-white">
      {/* 상단 헤더 */}
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

      {/* 에디터 본문 */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* 좌측 사이드바 (설정) */}
        <aside className="w-full md:w-[380px] lg:w-[420px] shrink-0 border-r border-white/5 bg-spotify-dark-surface flex flex-col z-10 shadow-spotify">
          <div className="flex p-3 gap-2 bg-spotify-near-black border-b border-white/5 shrink-0">
            <button
              onClick={() => setSidebarTab("blocks")}
              className={`flex-1 text-[13px] font-bold py-2.5 rounded-full transition-all cursor-pointer ${
                sidebarTab === "blocks"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
            >
              블록 구성
            </button>
            <button
              onClick={() => setSidebarTab("settings")}
              className={`flex-1 text-[13px] font-bold py-2.5 rounded-full transition-all cursor-pointer ${
                sidebarTab === "settings"
                  ? "bg-white text-black shadow-spotify-md"
                  : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"
              }`}
            >
              스타일 & 설정
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-spotify-dark-surface">
            {sidebarTab === "blocks" ? BlocksPanel : SettingsPanel}
          </div>
        </aside>

        {/* 우측 사이드바 (실시간 미리보기) */}
        <main className="hidden md:flex flex-1 bg-spotify-near-black overflow-y-auto relative items-start justify-center pt-8 pb-32">
          {/* 미리보기 영역용 은은한 격자 배경 */}
          <div
            className="
              pointer-events-none absolute inset-0
              bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]
              bg-size-[40px_40px]
            "
          />
          <div className="w-full max-w-[1000px] bg-spotify-dark-surface rounded-t-[32px] md:rounded-[32px] overflow-hidden shadow-spotify border border-white/5 mx-6 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* 브라우저 목업 헤더 */}
            <div className="h-10 bg-spotify-near-black border-b border-white/5 flex items-center px-4 gap-2 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto bg-spotify-mid-dark border border-white/5 rounded-full px-16 py-1 text-[11px] text-spotify-silver font-mono flex items-center gap-2 shadow-inner">
                <Globe className="w-3.5 h-3.5 text-spotify-silver/50" />
                {initialData?.slug}.portfolioforge.app
              </div>
            </div>

            {/* 실시간 포트폴리오 미리보기 컴포넌트 마운트 */}
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

      {/* 프로젝트 선택 모달 (AdjustStep에서 이관됨) */}
      {isEditingProjects && (
        <div className="fixed inset-0 z-50 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingProjects(false)}
                className="p-2 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <h3 className="text-[18px] font-bold text-white">
                대표 리포지토리 선택 ({tempSelectedIds.length})
              </h3>
            </div>
            <Button
              className="btn-pill-primary h-11 px-8 font-bold cursor-pointer"
              onClick={saveProjectChanges}
              disabled={isSaving}
            >
              적용하기
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10 max-w-5xl mx-auto w-full">
            <div className="mb-8 space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-spotify-silver" />
                <Input
                  placeholder="리포지토리 검색..."
                  className="pl-12 h-14 bg-spotify-dark-surface border border-white/5 rounded-full text-[16px] focus:border-spotify-green text-white placeholder:text-spotify-silver/30 transition-all"
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProjects?.map((project: RawProject) => (
                <Card
                  key={project.id}
                  onClick={() => toggleTempProject(project.id)}
                  className={`
                    relative p-6 cursor-pointer rounded-[28px] border transition-all duration-300 group
                    ${
                      tempSelectedIds.includes(project.id)
                        ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green/30 text-white shadow-spotify"
                        : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark text-white shadow-spotify"
                    }
                  `}
                >
                  <div className="absolute top-5 right-5 h-6 w-6 rounded-full border border-white/5 bg-spotify-near-black flex items-center justify-center transition-colors">
                    {tempSelectedIds.includes(project.id) && (
                      <div className="h-full w-full rounded-full bg-spotify-green flex items-center justify-center animate-in zoom-in-50 duration-200">
                        <Check className="w-4 h-4 text-black" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="pr-10">
                      <h4 className="font-extrabold text-[17px] text-white group-hover:text-spotify-green transition-colors line-clamp-1">
                        {project.name}
                      </h4>
                      <p className="text-[14px] text-spotify-silver line-clamp-2 mt-2 leading-relaxed min-h-[40px]">
                        {project.description || "설명이 없는 프로젝트입니다."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.language && (
                        <span className="px-2.5 py-1 rounded-lg bg-white/5 text-[11px] font-bold text-spotify-silver uppercase tracking-wider border border-white/5">
                          {project.language}
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-[12px] text-spotify-silver font-bold">
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
                        className="pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
                      >
                        <Label className="text-[11px] font-bold text-spotify-green uppercase tracking-wider flex items-center gap-2">
                          포트폴리오용 프로젝트 소개
                          <span className="px-1.5 py-0.5 rounded-md bg-spotify-green/10 text-spotify-green text-[10px]">
                            Markdown
                          </span>
                        </Label>

                        <MarkdownEditor
                          value={
                            tempCustomDescriptions[project.id] ||
                            project.description ||
                            ""
                          }
                          onChange={(value: string) => {
                            setTempCustomDescriptions((prevDescriptions: Record<string, string>) => ({
                              ...prevDescriptions,
                              [project.id]: value,
                            }));
                          }}
                        />

                        <p className="text-[11px] text-spotify-silver font-medium leading-relaxed">
                          README 요약 대신 이 내용이 우선적으로 노출됩니다. 직접
                          작성하거나 기존 마크다운 파일을 불러올 수 있습니다.
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
              {filteredProjects?.length === 0 && (
                <div className="col-span-full py-20 text-center">
                  <p className="text-spotify-silver font-bold text-lg">
                    검색 결과가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
