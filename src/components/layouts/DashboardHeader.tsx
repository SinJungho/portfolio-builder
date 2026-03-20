"use client";

import { Bell, User, Plus, ChevronLeft, Sparkles, Copy, ExternalLink, Check } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  const isGenerateFlow = pathname.startsWith("/generate");
  const step = searchParams.get("step");
  const isAdjustStep = isGenerateFlow && step === "adjust";
  
  // Extract ID from /generate/[id]
  const portfolioId = pathname.split("/")[2];

  const handleCopy = () => {
    const pubUrl = `${window.location.origin}/${portfolioId}`;
    navigator.clipboard.writeText(pubUrl);
    setCopied(true);
    toast.success("링크가 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-2">
          {isGenerateFlow && (
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="group flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all active:scale-95 border border-black/5 mr-3"
              >
                <ChevronLeft className="h-5 w-5 text-gray-900 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </button>
              <div className="h-5 w-px bg-black/5 mr-5 hidden md:block" />
            </div>
          )}

          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3182F6] text-white shadow-[0_4px_12px_rgba(49,130,246,0.3)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-[19px] font-bold tracking-tight text-[#191F28] hidden sm:block">PortfolioForge</span>
          </Link>

          <div className="h-4 w-px bg-gray-200 ml-4 hidden lg:block" />

          <h1 className="hidden lg:block text-[15px] font-bold text-[#4E5968] ml-2">
            {isGenerateFlow ? (isAdjustStep ? "디자인 및 상세 조정" : "포트폴리오 생성") : "내 포트폴리오"}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdjustStep ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest leading-none mb-1">Public URL</span>
                <span className="font-mono text-[11px] font-medium text-blue-500/60 truncate max-w-[120px]">
                  {portfolioId}.portfolioforge.app
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy} 
                className="rounded-xl h-9 sm:h-10 px-3 sm:px-4 border-black/5 hover:bg-gray-50 font-bold gap-1.5 sm:gap-2 text-[12px] sm:text-[13px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#20C997]" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                <span className="hidden sm:inline">{copied ? "복사됨" : "링크 복사"}</span>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className="rounded-xl h-9 sm:h-10 px-4 sm:px-5 bg-[#3182F6] hover:bg-[#1A6EE8] font-bold text-[12px] sm:text-[13px] shadow-[0_4px_12px_rgba(49,130,246,0.2)]"
              >
                <Link href={`/${portfolioId}`} target="_blank" className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden sm:inline">결과 보기</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          ) : !isGenerateFlow && (
            <Link href="/generate/new">
              <button className="flex items-center gap-1.5 sm:gap-2 bg-[#3182F6] text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-[13px] sm:text-[14px] font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_8px_16px_rgba(49,130,246,0.2)]">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">새 포트폴리오</span>
              </button>
            </Link>
          )}
          
          <div className="h-6 w-px bg-gray-200 mx-0.5 hidden sm:block" />
          
          <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-xl border border-black/5">
            <button className="hidden xs:flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg text-gray-400 hover:bg-white hover:text-[#3182F6] transition-all">
              <Bell className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>
            <button className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white shadow-sm border border-black/3 text-gray-600">
              <User className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
