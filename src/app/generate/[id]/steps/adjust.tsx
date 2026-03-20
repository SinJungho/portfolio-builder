"use client";

import { useEffect, useState } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { 
  Loader2, 
  User, 
  Grid, 
  BarChart, 
  Mail, 
  Rss, 
  ArrowUp, 
  ArrowDown, 
  Copy, 
  ExternalLink, 
  ArrowLeft, 
  Check, 
  ArrowRight, 
  Sparkles, 
  Palette,
  Trash2,
  Settings,
  Search,
  Star,
  GitFork,
  Clock,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
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
import { Card } from "@/components/ui/card";

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

const themes = [
  { id: "minimalist", name: "Minimalist", colors: ["#ffffff", "#f3f4f6", "#111827"] },
  { id: "creative", name: "Creative", colors: ["#eef2ff", "#c7d2fe", "#312e81"] },
  { id: "corporate", name: "Corporate", colors: ["#f8fafc", "#cbd5e1", "#0f172a"] },
  { id: "dark", name: "Dark", colors: ["#09090b", "#27272a", "#f4f4f5"] },
  { id: "pastel", name: "Pastel", colors: ["#fff1f2", "#fecdd3", "#881337"] },
  { id: "tech", name: "Tech", colors: ["#0d1117", "#161b22", "#c9d1d9"] },
];

interface RawProject {
  id: string;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
}

// 모바일 탭 타입
type MobileTab = "blocks" | "settings";

export default function AdjustStep({ portfolioId, initialData }: { portfolioId: string; initialData?: {
  portfolioId: string;
  blocks: Array<{
    id: string;
    block_type: string;
    position: number;
    config: Record<string, unknown>;
    is_visible: boolean;
    is_ai_generated: boolean;
  }>;
  theme: string;
  isPublished: boolean;
  publishedUrl: string | null;
} }) {
  const { 
    blocks, 
    theme, 
    isSaving, 
    initialize, 
    toggleBlock, 
    reorderBlocks, 
    setTheme, 
    updateOptionalField,
    deleteBlock,
    updateBlockConfig
  } = usePortfolioStore();
  
  const [copied, setCopied] = useState(false);
  const [init, setInit] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
  
  // Project selection state
  const [isEditingProjects, setIsEditingProjects] = useState(false);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [tempSelectedIds, setTempSelectedIds] = useState<string[]>([]);
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
        blocks: initialData.blocks.map(b => ({
          ...b,
          block_type: b.block_type as any,
        })),
      });
      setInit(true);
    }
  }, [initialData, init, initialize]);

  const pubUrl = initialData?.publishedUrl || `${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/${portfolioId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pubUrl);
    setCopied(true);
    toast.success("배포 URL이 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    newBlocks.forEach((b, i) => (b.position = i));
    reorderBlocks(newBlocks);
  };

  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index + 1], newBlocks[index]] = [newBlocks[index], newBlocks[index + 1]];
    newBlocks.forEach((b, i) => (b.position = i));
    reorderBlocks(newBlocks);
  };

  const contactBlock = blocks.find(b => b.block_type === "contact");

  const handleOptionalChange = (field: string, value: string) => {
    if (!contactBlock) return;
    updateOptionalField(contactBlock.id, { [field]: value }).then(() => {
      toast.success("저장되었습니다");
    });
  };

  const openProjectEditor = (block: any) => {
    setEditingBlockId(block.id);
    setTempSelectedIds((block.config.project_ids as string[]) || []);
    setIsEditingProjects(true);
  };

  const saveProjectChanges = () => {
    if (!editingBlockId) return;
    const block = blocks.find(b => b.id === editingBlockId);
    if (block) {
      updateBlockConfig(editingBlockId, {
        ...block.config,
        project_ids: tempSelectedIds
      }).then(() => {
        setIsEditingProjects(false);
        setEditingBlockId(null);
        toast.success("대표 리포지토리가 업데이트되었습니다.");
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
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8" /></div>;
  }

  // 블록 목록 패널 (공용 콘텐츠)
  const BlocksPanel = (
    <div className="space-y-6">
      <div className="bg-white border border-black/3 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#191F28] flex items-center gap-3">
            블록 구성
            {isSaving && <Loader2 className="inline w-5 h-5 animate-spin text-blue-500" />}
          </h2>
        </div>
        <div className="space-y-4">
          {blocks.map((block, index) => (
            <div 
              key={block.id} 
              className={`
                group flex flex-col p-5 sm:p-6 border rounded-[24px] bg-white transition-all duration-300 gap-5
                ${!block.is_visible ? "opacity-40 grayscale bg-gray-50/50" : "shadow-[0_4px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)]"}
              `}
            >
              <div className="flex items-center gap-4 w-full min-w-0">
                <div 
                  className={`p-3 rounded-2xl transition-colors shrink-0 ${!block.is_visible ? "bg-gray-100" : "bg-blue-50"}`}
                  style={{ color: !block.is_visible ? "#ADB5BD" : "#3182F6" }}
                >
                  {blockTypeIcons[block.block_type] || <Grid className="w-6 h-6" />}
                </div>
                <div className="space-y-1 overflow-hidden min-w-0 flex-1">
                  <h3 className="font-bold text-[17px] text-[#191F28] truncate">{blockTypeLabels[block.block_type] || block.block_type}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {block.is_ai_generated && (
                      <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded-md tracking-wider">AI Generated</span>
                    )}
                    {block.block_type === 'project_grid' && block.is_visible && (
                      <button 
                        onClick={() => openProjectEditor(block)}
                        className="group/edit inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-[#3182F6] text-[#3182F6] hover:text-white rounded-full text-[12px] font-bold transition-all duration-300 shadow-sm shadow-blue-500/5 active:scale-95 whitespace-nowrap"
                      >
                        <Settings className="w-3.5 h-3.5 transition-transform group-hover/edit:rotate-45" />
                        <span>프로젝트 설정</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-5 border-t border-black/5 mt-auto">
                <div className="flex items-center gap-3">
                  <div className="flex rounded-xl overflow-hidden border border-black/5">
                    <button 
                      onClick={() => moveUp(index)} 
                      disabled={index === 0} 
                      className="p-2.5 bg-gray-50 hover:bg-gray-100 disabled:opacity-20 transition-colors"
                      title="위로 이동"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => moveDown(index)} 
                      disabled={index === blocks.length - 1} 
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
                      onCheckedChange={() => toggleBlock(block.id)}
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
                    <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-[32px] border-none shadow-2xl p-8">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-[20px] font-extrabold text-[#191F28]">블록을 완전히 삭제할까요?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[15px] font-medium leading-relaxed text-[#4E5968]">
                          이 블록과 관련된 모든 설정이 영구적으로 삭제됩니다. 보이지 않게만 하고 싶다면 스위치를 꺼주세요.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-4">
                        <AlertDialogCancel className="w-full sm:w-auto rounded-2xl h-11 border-black/5 font-bold order-2 sm:order-1">취소</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteBlock(block.id)}
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
          ))}
          {blocks.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-100 rounded-[32px] gap-4">
               <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                 <Grid className="w-8 h-8" />
               </div>
               <p className="text-gray-400 font-bold">추가된 블록이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // 설정 패널 (공용 콘텐츠)
  const SettingsPanel = (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white border border-black/3 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#191F28] flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-500" />
          테마 스타일
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                group flex flex-col gap-3 p-4 border rounded-2xl transition-all text-left
                ${theme === t.id ? "border-[#3182F6] bg-blue-50/30 ring-1 ring-[#3182F6]" : "hover:border-blue-200 hover:bg-blue-50/10 border-black/5"}
              `}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[13px] font-bold ${theme === t.id ? "text-[#3182F6]" : "text-gray-500"}`}>{t.name}</span>
                {theme === t.id && <div className="w-2 h-2 rounded-full bg-[#3182F6] shadow-[0_0_8px_rgba(49,130,246,0.6)]" />}
              </div>
              <div className="flex gap-1.5 h-4 w-full">
                {t.colors.map((c, i) => (
                  <div key={i} className="flex-1 rounded-[4px] border border-black/3" style={{ backgroundColor: c }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Optional Fields */}
      <div className="bg-white border border-black/3 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
        <div className="space-y-1">
          <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#191F28] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            연락처 보완
          </h3>
          <p className="text-[13px] sm:text-[14px] text-gray-400 font-medium">소셜 링크를 추가해 신뢰도를 높여보세요.</p>
        </div>
        {contactBlock ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                className="rounded-xl border-black/5 bg-gray-50/30 focus:bg-white transition-all h-11"
                defaultValue={(contactBlock.config?.email as string) || ""}
                onBlur={(e) => handleOptionalChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="linkedin" className="text-sm font-medium">LinkedIn URL</Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="rounded-xl border-black/5 bg-gray-50/30 focus:bg-white transition-all h-11"
                defaultValue={(contactBlock.config?.linkedin_url as string) || ""}
                onBlur={(e) => handleOptionalChange("linkedin_url", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-sm font-medium">개인 웹사이트</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                className="rounded-xl border-black/5 bg-gray-50/30 focus:bg-white transition-all h-11"
                defaultValue={(contactBlock.config?.website_url as string) || ""}
                onBlur={(e) => handleOptionalChange("website_url", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="text-[13px] text-gray-400 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 text-center">
            연락처 블록을 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-[#FAFAFA] pb-24">
      {/* Subtle grid background */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-7xl pt-4 px-4 gap-6 md:gap-10 mx-auto">
        {/* Mobile Tab Switcher (visible only on <lg) */}
        <div className="lg:hidden flex bg-gray-100 rounded-[20px] p-1.5 gap-1.5 shadow-inner">
          <button
            onClick={() => setMobileTab("blocks")}
            className={`flex-1 text-[14px] font-bold py-3 rounded-2xl transition-all ${
              mobileTab === "blocks"
                ? "bg-white text-[#3182F6] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            블록 관리
          </button>
          <button
            onClick={() => setMobileTab("settings")}
            className={`flex-1 text-[14px] font-bold py-3 rounded-2xl transition-all ${
              mobileTab === "settings"
                ? "bg-white text-[#3182F6] shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            스타일 · 연락처
          </button>
        </div>

        {/* Desktop: 2-column grid layout (Balanced width) */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-10">
          {/* Left Panel: Block List */}
          <div className="space-y-6">
            {BlocksPanel}
          </div>
          {/* Right Panel */}
          <div className="space-y-6">
            {SettingsPanel}
          </div>
        </div>

        {/* Mobile: Tab-based layout */}
        <div className="lg:hidden">
          {mobileTab === "blocks" ? BlocksPanel : SettingsPanel}
        </div>
      </div>

      {/* Project Selection Modal (Full-screen Overlay) */}
      {isEditingProjects && (
        <div className="fixed inset-0 z-100 bg-white animate-in slide-in-from-bottom duration-300 flex flex-col">
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
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {project.pushed_at ? formatDistanceToNow(new Date(project.pushed_at), { addSuffix: true, locale: ko }) : "-"}
                        </div>
                      </div>
                    </div>
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

