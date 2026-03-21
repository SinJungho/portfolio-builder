"use client";

import { Bell, ChevronLeft, Sparkles, Copy, ExternalLink, Check, LayoutDashboard, Settings, LogOut, User, Plus, Menu } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const LogoMark = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3182F6] text-white shadow-[0_4px_12px_rgba(49,130,246,0.3)] shrink-0">
    <Sparkles className="h-5 w-5" />
  </div>
);

export function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [copied, setCopied] = useState(false);
  
  const isGenerateFlow = pathname.startsWith("/generate");
  const step = searchParams.get("step");
  const isAdjustStep = isGenerateFlow && step === "adjust";
  const portfolioId = pathname.split("/")[2];
  const user = session?.user;

  const handleCopy = () => {
    const pubUrl = `${window.location.origin}/${portfolioId}`;
    navigator.clipboard.writeText(pubUrl);
    setCopied(true);
    toast.success("링크가 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-ink-100 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
        <div className="flex items-center gap-2">
          {isGenerateFlow && (
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="group flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 hover:bg-ink-100 transition-all active:scale-95 border border-ink-100 mr-3"
              >
                <ChevronLeft className="h-5 w-5 text-ink-900 group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </button>
            </div>
          )}

          <Link href="/" className={cn("flex items-center gap-2 hover:opacity-80 transition-all", isGenerateFlow ? "hidden sm:flex" : "md:hidden")}>
            <LogoMark />
            <span className="text-[18px] font-bold tracking-tight text-ink-900">PortfolioForge</span>
          </Link>

          {!isGenerateFlow && <div className="h-4 w-px bg-ink-100 mx-4 hidden lg:block" />}

          <h1 className={cn("hidden lg:block text-[15px] font-bold text-ink-500", !isGenerateFlow && "lg:block")}>
            {isGenerateFlow ? (isAdjustStep ? "디자인 및 상세 조정" : "포트폴리오 생성") : "내 포트폴리오"}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdjustStep ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col items-end mr-2">
                <span className="text-[9px] font-bold text-ink-300 uppercase tracking-widest leading-none mb-1">Public URL</span>
                <span className="font-mono text-[11px] font-medium text-blue-600 truncate max-w-[150px]">
                  {portfolioId}.portfolioforge.app
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy} 
                className="rounded-xl h-10 px-4 border-ink-100 hover:bg-ink-50 font-bold gap-2 text-ink-600"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? "복사됨" : "링크 복사"}</span>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className="rounded-xl h-10 px-5 bg-blue-600 hover:bg-blue-700 font-bold shadow-[0_4px_12px_rgba(49,130,246,0.2)]"
              >
                <Link href={`/${portfolioId}`} target="_blank" className="flex items-center gap-2">
                  <span className="hidden sm:inline">결과 보기</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : !isGenerateFlow && (
            <Link href="/generate/new">
              <Button size="sm" className="rounded-xl h-10 px-5 bg-blue-600 hover:bg-blue-700 font-bold shadow-[0_4px_12px_rgba(49,130,246,0.2)] gap-2 border-none">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">새 포트폴리오</span>
              </Button>
            </Link>
          )}
          
          <div className="h-6 w-px bg-ink-100 mx-1 hidden sm:block" />
          
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="hidden xs:flex h-9 w-9 rounded-xl text-ink-400 hover:text-blue-600 hover:bg-blue-50">
              <Bell className="h-4.5 w-4.5" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-50 hover:bg-ink-100 transition-all border border-ink-100 overflow-hidden outline-none focus:ring-2 focus:ring-blue-500/20">
                   {user?.image ? (
                    <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-ink-400" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 border-ink-100 shadow-xl">
                <DropdownMenuLabel className="font-normal px-2 py-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-ink-900">{user?.name || "사용자"}</p>
                    <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-ink-50 mb-1" />
                <DropdownMenuItem asChild className="rounded-xl py-2 cursor-pointer focus:bg-ink-50 focus:text-ink-900">
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="mr-2 h-4 w-4 text-ink-400" />
                    <span>대시보드</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl py-2 cursor-pointer focus:bg-ink-50 focus:text-ink-900">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-2 h-4 w-4 text-ink-400" />
                    <span>설정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-ink-50 my-1" />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="rounded-xl py-2 cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 font-medium"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
