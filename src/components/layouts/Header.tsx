"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChevronRight, Menu, Sparkles, LogOut, User, LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { name: "기능", href: "/features" },
  { name: "템플릿", href: "/templates" },
  { name: "블로그", href: "/blog" },
  { name: "대시보드", href: "/dashboard" },
] as const;

const LogoMark = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black shadow-[0_4px_12px_rgba(30,215,96,0.3)] shrink-0">
    <Sparkles className="h-5 w-5 stroke-[2.5px]" />
  </div>
);

export default function Header() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";
  const user = session?.user;

  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const onScroll = () => {
      if (mountedRef.current) setScrolled(window.scrollY > 20);
    };

    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      suppressHydrationWarning
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-spotify-near-black/70 backdrop-blur-md border-b border-white/5"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* 로고 */}
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full no-underline group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-4 focus-visible:ring-offset-spotify-near-black"
        >
          <LogoMark />
          <span className="text-[20px] font-bold text-white tracking-tight">
            PortfolioForge
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="rounded-full px-4 py-2 text-[14px] font-bold uppercase tracking-spotify text-spotify-silver no-underline transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-near-black"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* 데스크탑 CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isLoading ? (
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
          ) : isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="계정 메뉴 열기"
                  className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/5 bg-white/5 transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-near-black"
                >
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt={user.name || "User"}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={20} className="text-spotify-silver" />
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 mt-2 bg-spotify-mid-dark border-none rounded-2xl p-2 shadow-spotify">
                <DropdownMenuLabel className="font-normal px-3 py-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-[15px] font-bold text-white">{user?.name}</p>
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
                  <Link href="/settings" className="flex items-center w-full">
                    <Settings className="mr-3 h-4.5 w-4.5 opacity-70" />
                    <span className="font-bold">설정</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5 my-1" />
                <DropdownMenuItem
                  className="rounded-xl py-2.5 cursor-pointer text-spotify-negative focus:bg-spotify-negative/10 focus:text-spotify-negative font-bold"
                  onClick={() => signOut()}
                >
                  <LogOut className="mr-3 h-4.5 w-4.5" />
                  <span>로그아웃</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button
                asChild
                className="btn-pill-primary h-10 px-5 text-[14px] font-extrabold tracking-[-0.01em]"
              >
                <Link href="/login" aria-label="로그인하고 PortfolioForge 시작하기">
                  로그인
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* 모바일 햄버거 */}
        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-spotify-silver hover:bg-white/5 hover:text-white focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-near-black"
                aria-label="메뉴 열기"
              >
                <Menu size={24} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-full sm:w-80 p-0 flex flex-col bg-spotify-near-black border-none shadow-spotify"
            >
              {/* 헤더 — 로고 */}
              <SheetHeader className="px-6 h-16 sm:h-20 flex-row items-center justify-between border-b border-white/5 space-y-0">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-3 no-underline"
                    onClick={() => setOpen(false)}
                  >
                    <LogoMark />
                    <span className="text-[18px] font-bold text-white tracking-tight">
                      PortfolioForge
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* 네비게이션 링크 */}
              <nav className="flex-1 flex flex-col overflow-y-auto py-4">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-8 py-4 text-[16px] font-bold uppercase tracking-spotify text-spotify-silver no-underline transition-all hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-spotify-green"
                  >
                    {item.name}
                    <ChevronRight size={18} className="opacity-20" />
                  </Link>
                ))}
              </nav>

              {/* 하단 CTA */}
              <div className="px-6 pb-12 pt-6 border-t border-white/5 flex flex-col gap-4">
                {isLoggedIn ? (
                  <>
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 mb-2">
                       {user?.image ? (
                        <Image
                          src={user.image}
                          alt={user.name || "User"}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full border border-white/10"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-spotify-mid-dark flex items-center justify-center text-spotify-silver">
                          <User size={24} />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-white">{user?.name}</span>
                        <span className="text-[13px] text-spotify-silver truncate max-w-[150px]">{user?.email}</span>
                      </div>
                    </div>
                    <Button
                      className="btn-pill-primary h-12 w-full text-[15px]"
                      asChild
                    >
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        <LayoutDashboard size={18} className="mr-3" />
                        대시보드로 가기
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-12 rounded-full text-[15px] font-bold text-spotify-negative hover:bg-spotify-negative/10"
                      onClick={() => {
                        signOut();
                        setOpen(false);
                      }}
                    >
                      <LogOut size={18} className="mr-3" />
                      로그아웃
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      className="btn-pill-primary h-13 w-full rounded-2xl text-[15px] font-extrabold tracking-[-0.01em]"
                    >
                      <Link href="/login" onClick={() => setOpen(false)}>
                        로그인하고 시작하기
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
