"use client";

import { useState, useRef, useEffect } from "react";
import { Portfolio, PortfolioBlock } from "@prisma/client";
import { DesignTokens } from "@/schemas/portfolio";
import ThemeSettingsPanel from "./ThemeSettingsPanel";
import BlockSettingsPanel from "./BlockSettingsPanel"; // 새로 생성할 컴포넌트
import { Monitor, Smartphone, Tablet, ExternalLink, Save, Loader2, Palette, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ThemeCustomizerProps {
  portfolio: Portfolio;
  initialBlocks: PortfolioBlock[];
}

type DeviceView = "desktop" | "tablet" | "mobile";

export default function ThemeCustomizer({ portfolio, initialBlocks }: ThemeCustomizerProps) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 상태 관리: 디자인 토큰 및 블록 목록
  const [tokens, setTokens] = useState<DesignTokens>((portfolio.design_tokens as DesignTokens) || {});
  const [blocks, setBlocks] = useState<PortfolioBlock[]>(initialBlocks);
  const [device, setDevice] = useState<DeviceView>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  // 초기값 비교용 레퍼런스
  const initialData = useRef({
    tokens: portfolio.design_tokens as DesignTokens,
    blocks: initialBlocks
  });

  // 토큰 또는 블록 변경 시 Iframe으로 실시간 전송
  useEffect(() => {
    const sendUpdate = () => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          { 
            type: "PORTFOLIO_STATE_UPDATE", 
            tokens,
            blocks: blocks.filter(b => b.is_visible) 
          },
          "*"
        );
      }
    };

    sendUpdate();
    
    // 변경 여부 체크
    const hasTokensChanged = JSON.stringify(tokens) !== JSON.stringify(initialData.current.tokens);
    const hasBlocksChanged = JSON.stringify(blocks) !== JSON.stringify(initialData.current.blocks);
    setIsChanged(hasTokensChanged || hasBlocksChanged);
  }, [tokens, blocks]);

  const handleTokenChange = (newTokens: Partial<DesignTokens>) => {
    setTokens((prev) => ({ ...prev, ...newTokens }));
  };

  const handleBlocksChange = (newBlocks: PortfolioBlock[]) => {
    setBlocks(newBlocks);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const res = await fetch(`/api/portfolios/${portfolio.id}/batch-update`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          design_tokens: tokens,
          blocks: blocks.map((b, i) => ({ ...b, position: i })) 
        }),
      });

      if (!res.ok) throw new Error("저장에 실패했습니다.");
      
      initialData.current = { tokens, blocks };
      setIsChanged(false);
      toast.success("설정이 저장되었습니다!");
      router.refresh();
    } catch (error) {
      toast.error("죄송합니다. 저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const iframeWidth = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  const previewUrl = `/${portfolio.slug}?preview=true`;

  return (
    <div className="flex h-full bg-[#F2F4F6]">
      {/* Sidebar Editor (Left) */}
      <aside className="w-[360px] h-full bg-white border-r border-black/5 flex flex-col shadow-xl z-20">
        <Tabs defaultValue="design" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 h-14 bg-white border-b border-black/5 rounded-none p-0">
            <TabsTrigger 
              value="design" 
              className="h-full data-[state=active]:bg-blue-50 data-[state=active]:text-[#3182F6] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#3182F6] font-bold"
            >
              <Palette className="w-4 h-4 mr-2" />
              디자인
            </TabsTrigger>
            <TabsTrigger 
              value="layout" 
              className="h-full data-[state=active]:bg-blue-50 data-[state=active]:text-[#3182F6] data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-[#3182F6] font-bold"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              레이아웃
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto scrollbar-hide bg-white">
            <TabsContent value="design" className="m-0 border-none outline-none">
              <ThemeSettingsPanel 
                tokens={tokens} 
                onChange={handleTokenChange} 
                portfolioTitle={portfolio.title || portfolio.slug}
              />
            </TabsContent>
            <TabsContent value="layout" className="m-0 border-none outline-none p-6">
              <BlockSettingsPanel 
                blocks={blocks} 
                onBlocksChange={handleBlocksChange}
              />
            </TabsContent>
          </div>
        </Tabs>

        <div className="p-6 border-t border-black/5 bg-white shrink-0 z-30">
          <Button 
            className="w-full h-14 rounded-[18px] bg-[#3182F6] hover:brightness-110 text-white font-bold text-[16px] shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:bg-gray-200"
            onClick={handleSave}
            disabled={!isChanged || isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                적용 및 저장하기
              </>
            )}
          </Button>
        </div>
      </aside>

      {/* Preview Area (Right) */}
      <section className="flex-1 flex flex-col items-center">
        <div className="h-14 w-full flex items-center justify-center gap-2 bg-white/50 backdrop-blur-md border-b border-black/5 shrink-0 px-6">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            {(["desktop", "tablet", "mobile"] as DeviceView[]).map((v) => (
              <button
                key={v}
                onClick={() => setDevice(v)}
                className={`p-2 rounded-lg transition-all ${
                  device === v ? "bg-white shadow-sm text-[#3182F6]" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {v === "desktop" && <Monitor className="w-4.5 h-4.5" />}
                {v === "tablet" && <Tablet className="w-4.5 h-4.5" />}
                {v === "mobile" && <Smartphone className="w-4.5 h-4.5" />}
              </button>
            ))}
          </div>
          
          <div className="ml-auto flex items-center gap-3">
             <a 
               href={previewUrl} 
               target="_blank" 
               className="text-[13px] font-bold text-gray-500 hover:text-[#3182F6] flex items-center gap-1.5 transition-colors"
             >
                <ExternalLink className="w-3.5 h-3.5" />
                전체 화면 보기
             </a>
          </div>
        </div>

        <div className="flex-1 w-full flex justify-center items-center p-6 md:p-10 overflow-hidden relative">
          <div 
            className="h-full shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] rounded-[24px] overflow-hidden bg-white border border-black/5 transition-all duration-500 ease-out flex flex-col"
            style={{ width: iframeWidth[device] }}
          >
            <div className="h-10 bg-gray-50 border-b border-black/5 flex items-center px-4 gap-2 shrink-0">
               <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
               </div>
               <div className="flex-1 mx-4 bg-white rounded-md h-6 border border-black/3 flex items-center px-3">
                  <span className="text-[10px] text-gray-400 font-medium truncate">{portfolio.slug}.portfolioforge.app</span>
               </div>
            </div>

            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="flex-1 w-full border-none pointer-events-auto"
              title="Portfolio Preview"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
