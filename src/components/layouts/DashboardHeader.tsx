"use client";

import { BarChart3, ChevronLeft, Sparkles, Copy, ExternalLink, Check, LayoutDashboard, Settings, LogOut, User, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { signOut } from "next-auth/react";
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
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black shadow-[0_4px_12px_rgba(30,215,96,0.3)] shrink-0">
    <Sparkles className="h-5 w-5 stroke-[2.5px]" />
  </div>
);

export function DashboardHeader({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  
  const isGenerateFlow = pathname.startsWith("/generate");
  const pageTitle = pathname.startsWith("/analytics")
    ? "분석"
    : pathname.startsWith("/settings")
      ? "설정"
      : "내 포트폴리오";
  const step = searchParams.get("step");
  const isAdjustStep = isGenerateFlow && step === "adjust";
  const portfolioId = pathname.split("/")[2];

  if (pathname.startsWith("/editor/")) return null;

  const handleCopy = () => {
    const pubUrl = `${window.location.origin}/${portfolioId}`;
    navigator.clipboard.writeText(pubUrl);
    setCopied(true);
    toast.success("링크가 복사되었습니다.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-spotify-near-black/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-10">
        <div className="flex items-center gap-2">
          {isGenerateFlow && (
            <div className="flex items-center">
              <button 
                onClick={() => router.back()}
                className="group flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all active:scale-95 border border-white/5 mr-3"
              >
                <ChevronLeft className="h-5 w-5 text-white group-hover:-translate-x-0.5 transition-transform" strokeWidth={2.5} />
              </button>
            </div>
          )}

          <Link href="/" className={cn("flex items-center gap-3 hover:opacity-80 transition-all", isGenerateFlow ? "hidden sm:flex" : "md:hidden")}>
            <LogoMark />
            <span className="text-[20px] font-bold tracking-tight text-white">PortfolioForge</span>
          </Link>

          {!isGenerateFlow && <div className="h-4 w-px bg-white/10 mx-4 hidden lg:block" />}

          <h1 className={cn("hidden lg:block text-[15px] font-bold text-spotify-silver", !isGenerateFlow && "lg:block")}>
            {isGenerateFlow ? (isAdjustStep ? "디자인 및 상세 조정" : "포트폴리오 생성") : pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdjustStep ? (
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex flex-col items-end mr-3">
                <span className="text-[9px] font-bold text-spotify-silver tracking-spotify leading-none mb-1">공개 주소</span>
                <span className="font-mono text-[11px] font-medium text-spotify-green truncate max-w-[150px]">
                  {portfolioId}.portfolioforge.app
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopy} 
                className="btn-pill h-10 px-5 border-white/10 hover:bg-white/5 bg-transparent font-bold gap-2 text-white"
              >
                {copied ? <Check className="w-4 h-4 text-spotify-green" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? "복사됨" : "링크 복사"}</span>
              </Button>
              <Button 
                size="sm" 
                asChild 
                className="btn-pill-primary h-10 px-6 font-bold"
              >
                <Link href={`/${portfolioId}`} target="_blank" className="flex items-center gap-2">
                  <span className="hidden sm:inline">결과 보기</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : !isGenerateFlow && !pathname.startsWith("/dashboard") && (
            <Link href="/dashboard#new-portfolio" className="hidden md:block">
              <Button
                size="sm"
                className="btn-pill-primary h-10 px-6 font-bold gap-2"
                aria-label="새 포트폴리오 만들기"
                title="새 포트폴리오 만들기"
              >
                <Plus className="w-4 h-4" aria-hidden="true" />
                <span className="hidden sm:inline">새 포트폴리오</span>
              </Button>
            </Link>
          )}
          
          <div className="h-6 w-px bg-white/10 mx-2 hidden sm:block" />
          
          <div className="flex items-center gap-1.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/5 overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green">
                   {user?.image ? (
                    <Image src={user.image} alt={user.name || ""} width={36} height={36} className="w-full h-full object-cover" />
                  ) : (
                    <User className="h-5 w-5 text-spotify-silver" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 mt-2 bg-spotify-mid-dark border-none rounded-2xl p-2 shadow-spotify">
                <DropdownMenuLabel className="font-normal px-3 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-[15px] font-bold text-white">{user?.name || "사용자"}</p>
                    <p className="text-xs text-spotify-silver truncate">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 mb-1" />
                <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer focus:bg-white/5 focus:text-white text-spotify-silver">
                  <Link href="/dashboard" className="flex items-center w-full">
                    <LayoutDashboard className="mr-3 h-4.5 w-4.5 opacity-70" />
                    <span className="font-bold">대시보드</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer focus:bg-white/5 focus:text-white text-spotify-silver">
                  <Link href="/analytics" className="flex items-center w-full">
                    <BarChart3 className="mr-3 h-4.5 w-4.5 opacity-70" />
                    <span className="font-bold">분석</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl py-2.5 cursor-pointer focus:bg-white/5 focus:text-white text-spotify-silver">
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-3 h-4.5 w-4.5 opacity-70" />
                    <span className="font-bold">설정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="rounded-xl py-2.5 cursor-pointer text-spotify-negative focus:bg-spotify-negative/10 focus:text-spotify-negative font-bold"
                >
                  <LogOut className="mr-3 h-4.5 w-4.5" />
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
