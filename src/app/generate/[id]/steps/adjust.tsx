"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Block, usePortfolioStore } from "@/stores/portfolioStore";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowUpRight,
  BarChart,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  GitFork,
  Globe,
  Grid,
  Linkedin,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Rss,
  Search,
  Settings,
  Sparkles,
  Star,
  Twitter,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { type RawProject } from "@/types/project";
import { type PortfolioInitialData } from "@/types/portfolio";

import DesignEditor from "@/components/features/editor/DesignEditor";
import MarkdownEditor from "@/components/ui/MarkdownEditor";
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
import { SortableBlockItem } from "./components/SortableBlockItem";

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

// 모바일 탭 타입
type MobileTab = "blocks" | "settings";

export default function AdjustStep({
  initialData,
}: {
  initialData?: PortfolioInitialData;
}) {
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

  const [init, setInit] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("blocks");
  const [showDnsManual, setShowDnsManual] = useState(false);

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

  useEffect(() => {
    if (initialData && !init) {
      initialize({
        ...initialData,
        blocks: initialData.blocks.map((b) => ({
          ...b,
          block_type: b.block_type as Block["block_type"],
        })),
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInit(true);
    }
  }, [initialData, init, initialize]);

  const moveUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index - 1],
    ];
    newBlocks.forEach((b, i) => (b.position = i));
    reorderBlocks(newBlocks);
  };

  const moveDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index + 1], newBlocks[index]] = [
      newBlocks[index],
      newBlocks[index + 1],
    ];
    newBlocks.forEach((b, i) => (b.position = i));
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
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      newBlocks.forEach((b, i) => (b.position = i));
      reorderBlocks(newBlocks);
    }
  };

  const contactBlock = blocks.find((b) => b.block_type === "contact");

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
    const block = blocks.find((b) => b.id === editingBlockId);
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
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTempProject = (id: string) => {
    setTempSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  if (!init) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  // 블록 목록 패널 (공용 콘텐츠)
  const BlocksPanel = (
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
            items={blocks.map((b) => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {blocks.map((block, index) => (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  index={index}
                  totalBlocks={blocks.length}
                  icon={
                    blockTypeIcons[block.block_type] || (
                      <Grid className="w-6 h-6" />
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
            {Object.keys(blockTypeLabels).map((type) => {
              const isUnique = type === "hero" || type === "contact";
              const alreadyExists =
                isUnique && blocks.some((b) => b.block_type === type);

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

  // 설정 패널 (공용 콘텐츠)
  const SettingsPanel = (
    <div className="space-y-6">
      {/* 스타일 & 디자인 커스터마이징 (3단계) */}
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-spotify text-white">
        <DesignEditor />
      </div>
      {/* 도메인 설정 - Spotify 프리미엄 다크 리디자인 */}
      <div className="bg-[#121212] border border-white/5 rounded-[32px] p-6 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.2)] text-white space-y-6">
        <div className="space-y-1">
          <h3 className="text-[18px] sm:text-[20px] font-black text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-spotify-green animate-pulse" />
            도메인 설정
          </h3>
          <p className="text-[13px] sm:text-[14px] text-spotify-silver font-medium">
            나만의 고유한 브랜딩 주소로 포트폴리오를 배포하세요.
          </p>
        </div>

        <div className="space-y-5">
          {/* 기본 제공 주소 카드 */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase text-spotify-silver tracking-wider">
              기본 무료 제공 주소
            </Label>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-spotify-green" />
                <span className="text-[15px] font-bold text-white font-mono truncate max-w-[200px] sm:max-w-xs">
                  {initialData?.slug}.portfolioforge.app
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* 깜빡이는 라이브 배지 */}
                <span className="flex items-center gap-1.5 px-3 py-1 bg-spotify-green/10 rounded-full text-spotify-green text-[11px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_#1ed760]" />
                  Live
                </span>
                {/* 주소 복사 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-spotify-silver hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  onClick={() => {
                    const url = `https://${initialData?.slug}.portfolioforge.app`;
                    navigator.clipboard.writeText(url);
                    toast.success("포트폴리오 주소가 복사되었습니다!");
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                  복사
                </Button>
                {/* 새창열기 */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-spotify-silver hover:text-white hover:bg-white/10 text-xs font-bold rounded-lg flex items-center gap-1.5"
                  onClick={() =>
                    window.open(
                      `https://${initialData?.slug}.portfolioforge.app`,
                      "_blank",
                    )
                  }
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  열기
                </Button>
              </div>
            </div>

            {/* 소셜 공유 배너 */}
            <div className="flex flex-wrap items-center gap-3 p-4 bg-white/[0.02] border border-white/5 rounded-2xl text-xs font-bold text-spotify-silver">
              <span>🚀 SNS에 내 포트폴리오 자랑하기:</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-spotify-silver hover:text-[#1DA1F2] hover:bg-[#1DA1F2]/10 px-2.5 rounded-lg flex items-center gap-1 text-[11px]"
                onClick={() => {
                  const url = `https://${initialData?.slug}.portfolioforge.app`;
                  const shareText = `AI와 GitHub 분석으로 저만의 멋진 포트폴리오를 즉시 제작했어요! 포트폴리오 주소를 확인해 보세요 💻✨\n#PortfolioForge #개발자 #포트폴리오`;
                  window.open(
                    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`,
                    "_blank",
                  );
                }}
              >
                <Twitter className="w-3 h-3" />
                Twitter (X)
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-spotify-silver hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 px-2.5 rounded-lg flex items-center gap-1 text-[11px]"
                onClick={() => {
                  const url = `https://${initialData?.slug}.portfolioforge.app`;
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
                    "_blank",
                  );
                }}
              >
                <Linkedin className="w-3 h-3" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* 커스텀 도메인 설정 */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="custom-domain"
                className="text-xs font-black uppercase text-spotify-silver tracking-wider"
              >
                나만의 커스텀 도메인 연결{" "}
                <span className="text-[10px] text-spotify-silver/50 lowercase font-medium">
                  (optional)
                </span>
              </Label>
            </div>

            <div className="flex gap-2">
              <Input
                id="custom-domain"
                placeholder="www.yourdomain.com"
                className="rounded-xl h-11 bg-spotify-near-black border-white/5 focus:border-spotify-green text-white placeholder:text-spotify-silver/20"
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
                className="btn-pill-primary h-11 px-6 text-sm font-bold flex items-center gap-1.5"
                onClick={() => {
                  const input = document.getElementById(
                    "custom-domain",
                  ) as HTMLInputElement;
                  const val = input.value.trim();
                  setCustomDomain(val || null)
                    .then(() =>
                      toast.success("도메인 설정이 업데이트되었습니다."),
                    )
                    .catch((err) => toast.error(err.message));
                }}
              >
                연결
              </Button>
            </div>
            <p className="text-[11px] text-spotify-silver/60 leading-relaxed font-medium">
              * 개인 소유의 도메인을 입력한 뒤, 아래 DNS 가이드에 따라 CNAME
              또는 A 레코드를 설정해 주세요.
            </p>
          </div>

          {/* DNS 설정 가이드 배너 (아코디언 형태) */}
          <div className="border border-white/5 rounded-2xl overflow-hidden bg-white/[0.02]">
            <button
              onClick={() => setShowDnsManual(!showDnsManual)}
              className="w-full flex items-center justify-between p-4 text-[13px] font-bold text-white hover:bg-white/5 transition-all"
            >
              <span className="flex items-center gap-2">
                <Settings
                  className="w-4 h-4 text-spotify-green animate-spin"
                  style={{ animationDuration: "6s" }}
                />
                DNS 레코드 수동 설정 가이드
              </span>
              {showDnsManual ? (
                <ChevronUp className="w-4 h-4 text-spotify-silver" />
              ) : (
                <ChevronDown className="w-4 h-4 text-spotify-silver" />
              )}
            </button>

            {showDnsManual && (
              <div className="p-4 border-t border-white/5 space-y-4 text-[12px] text-spotify-silver leading-relaxed animate-in slide-in-from-top-2 duration-300">
                <p>
                  도메인 구매 대행업체(가비아, Cloudflare 등)의 DNS 관리
                  콘솔에서 아래 레코드를 추가해 주세요:
                </p>
                <div className="space-y-2 font-mono text-[11px] text-white">
                  <div className="p-3 bg-spotify-near-black border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-spotify-silver uppercase block font-sans">
                        Type A (루트 도메인용)
                      </span>
                      <span>
                        Name: <strong className="text-spotify-green">@</strong>{" "}
                        | Value: <strong>76.76.21.21</strong>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] text-spotify-silver hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText("76.76.21.21");
                        toast.success("A 레코드 값이 복사되었습니다.");
                      }}
                    >
                      복사
                    </Button>
                  </div>
                  <div className="p-3 bg-spotify-near-black border border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-spotify-silver uppercase block font-sans">
                        Type CNAME (서브 도메인용)
                      </span>
                      <span>
                        Name:{" "}
                        <strong className="text-spotify-green">www</strong> |
                        Value: <strong>cname.vercel-dns.com</strong>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-[10px] text-spotify-silver hover:text-white"
                      onClick={() => {
                        navigator.clipboard.writeText("cname.vercel-dns.com");
                        toast.success("CNAME 레코드 값이 복사되었습니다.");
                      }}
                    >
                      복사
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 space-y-2">
                  <span className="block font-bold text-white">
                    추천 도메인 구입처:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="https://www.gabia.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:text-white transition-all"
                    >
                      가비아 ↗
                    </a>
                    <a
                      href="https://www.cloudflare.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:text-white transition-all"
                    >
                      Cloudflare ↗
                    </a>
                    <a
                      href="https://www.namecheap.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white/5 border border-white/5 rounded hover:bg-white/10 hover:text-white transition-all"
                    >
                      Namecheap ↗
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 연결 상태 확인 카드 */}
          {customDomain && (
            <div className="p-5 bg-spotify-green/5 border border-spotify-green/20 rounded-2xl space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-black text-spotify-green flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-spotify-green rounded-full animate-pulse shadow-[0_0_8px_#1ed760]" />
                  커스텀 도메인 연결 상태
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-spotify-green hover:text-white hover:bg-spotify-green/10 font-bold rounded-lg"
                  onClick={async () => {
                    if (!customDomain) return;
                    const res = await fetch(`/api/domains/${customDomain}`);
                    const data = await res.json();
                    if (data.configured) {
                      toast.success(
                        "도메인 연결이 성공적으로 시뮬레이션 및 연결 완료되었습니다!",
                      );
                    } else {
                      toast.error("DNS 연결 상태를 확인하고 있습니다.");
                    }
                  }}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  새로고침
                </Button>
              </div>
              <div className="text-[12px] text-spotify-silver font-medium leading-relaxed">
                현재{" "}
                <strong className="text-white font-mono">{customDomain}</strong>{" "}
                주소가 포트폴리오에 등록되어 있습니다. DNS 전파는 최대
                24~48시간이 소요될 수 있으며, 모의 우회 설정에 따라 정상 연결로
                확인됩니다.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 추가 필드 (연락처 정보) */}
      <div className="bg-spotify-dark-surface border border-white/5 rounded-[32px] p-5 sm:p-6 md:p-8 shadow-spotify space-y-6 text-white">
        <div className="space-y-1 font-normal">
          <h3 className="text-[18px] sm:text-[20px] font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-spotify-green fill-current" />
            연락처 보완
          </h3>
          <p className="text-[13px] sm:text-[14px] text-spotify-silver font-medium">
            소셜 링크를 추가해 신뢰도를 높여보세요.
          </p>
        </div>
        {contactBlock ? (
          <div className="space-y-4">
            <div className="space-y-1.5 font-normal">
              <Label
                htmlFor="email"
                className="text-sm font-bold text-spotify-silver"
              >
                이메일
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@example.com"
                className="rounded-xl border-white/5 bg-spotify-near-black text-white focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all h-11 placeholder:text-spotify-silver/30"
                defaultValue={(contactBlock.config?.email as string) || ""}
                onBlur={(e) => handleOptionalChange("email", e.target.value)}
              />
            </div>
            <div className="space-y-1.5 font-normal">
              <Label
                htmlFor="linkedin"
                className="text-sm font-bold text-spotify-silver"
              >
                LinkedIn URL
              </Label>
              <Input
                id="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="rounded-xl border-white/5 bg-spotify-near-black text-white focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all h-11 placeholder:text-spotify-silver/30"
                defaultValue={
                  (contactBlock.config?.linkedin_url as string) || ""
                }
                onBlur={(e) =>
                  handleOptionalChange("linkedin_url", e.target.value)
                }
              />
            </div>
            <div className="space-y-1.5 font-normal">
              <Label
                htmlFor="website"
                className="text-sm font-bold text-spotify-silver"
              >
                개인 웹사이트
              </Label>
              <Input
                id="website"
                type="url"
                placeholder="https://..."
                className="rounded-xl border-white/5 bg-spotify-near-black text-white focus:border-spotify-green focus:ring-1 focus:ring-spotify-green transition-all h-11 placeholder:text-spotify-silver/30"
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
          <div className="text-[13px] text-spotify-silver bg-spotify-near-black/50 p-4 rounded-2xl border border-dashed border-white/5 text-center font-normal">
            연락처 블록을 찾을 수 없습니다.
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-spotify-near-black pb-24 text-white">
      {/* 미세한 그리드 배경 */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      <div className="relative z-10 flex flex-col flex-1 w-full max-w-7xl pt-4 px-4 gap-6 md:gap-10 mx-auto">
        {/* 모바일 탭 스위처 (lg 미만 화면에서만 표시) */}
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

        {/* 데스크톱: 2열 그리드 레이아웃 (균형 잡힌 너비) */}
        <div className="hidden lg:grid lg:grid-cols-2 gap-10">
          {/* 왼쪽 패널: 블록 목록 */}
          <div className="space-y-6">{BlocksPanel}</div>
          {/* 오른쪽 패널 */}
          <div className="space-y-6">{SettingsPanel}</div>
        </div>

        {/* 모바일: 탭 기반 레이아웃 */}
        <div className="lg:hidden">
          {mobileTab === "blocks" ? BlocksPanel : SettingsPanel}
        </div>
      </div>

      {/* 프로젝트 선택 모달 (전체 화면 오버레이) */}
      {isEditingProjects && (
        <div className="fixed inset-0 z-100 bg-spotify-near-black text-white animate-in slide-in-from-bottom duration-300 flex flex-col">
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 sticky top-0 bg-spotify-near-black/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditingProjects(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <h3 className="text-[18px] font-bold text-white">
                대표 리포지토리 선택 ({tempSelectedIds.length})
              </h3>
            </div>
            <Button
              className="bg-spotify-green hover:scale-105 active:scale-95 text-black rounded-full px-6 font-bold text-sm tracking-spotify transition-all flex items-center justify-center cursor-pointer"
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
                  className="pl-12 h-14 bg-spotify-mid-dark border-white/5 rounded-full text-[16px] text-white placeholder:text-spotify-silver/40 focus:ring-1 focus:ring-spotify-green focus:border-spotify-green transition-all"
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
                    relative p-6 cursor-pointer rounded-[28px] border transition-all duration-300 select-none
                    ${
                      tempSelectedIds.includes(project.id)
                        ? "border-spotify-green bg-spotify-green/5 ring-1 ring-spotify-green"
                        : "border-white/5 bg-spotify-dark-surface hover:bg-spotify-mid-dark hover:shadow-spotify"
                    }
                  `}
                >
                  <div className="absolute top-5 right-5 h-6 w-6 rounded-full border border-white/10 bg-spotify-mid-dark flex items-center justify-center transition-colors">
                    {tempSelectedIds.includes(project.id) && (
                      <div className="h-full w-full rounded-full bg-spotify-green flex items-center justify-center animate-in zoom-in-50 duration-200">
                        <Check
                          className="w-4 h-4 text-black stroke-[3px]"
                          strokeWidth={3}
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="pr-10">
                      <h4 className="font-extrabold text-[17px] text-white line-clamp-1">
                        {project.name}
                      </h4>
                      <p className="text-[14px] text-spotify-silver line-clamp-2 mt-2 leading-relaxed min-h-[40px] font-normal">
                        {project.description || "설명이 없는 프로젝트입니다."}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.language && (
                        <span className="px-2.5 py-1 rounded-lg bg-spotify-mid-dark border border-white/5 text-[11px] font-bold text-spotify-silver uppercase tracking-wider">
                          {project.language}
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-[12px] text-spotify-silver font-bold">
                        <div className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 text-spotify-silver" />
                          {project.stargazers_count}
                        </div>
                        <div className="flex items-center gap-1">
                          <GitFork className="w-3.5 h-3.5 text-spotify-silver" />
                          {project.forks_count}
                        </div>
                      </div>
                    </div>

                    {tempSelectedIds.includes(project.id) && (
                      <div
                        className="pt-4 border-t border-white/5 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
                        onClick={(e) => e.stopPropagation()}
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
                          onChange={(val) => {
                            setTempCustomDescriptions((prev) => ({
                              ...prev,
                              [project.id]: val,
                            }));
                          }}
                        />

                        <p className="text-[11px] text-spotify-silver font-medium leading-relaxed font-normal">
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
