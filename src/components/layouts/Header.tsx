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
import { ArrowRight, ChevronRight, Github, Menu } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import CTAButton from "../common/CTAButton";

const NAV_LINKS = [
  { name: "기능", href: "/features" },
  { name: "가격", href: "/pricing" },
  { name: "템플릿", href: "/templates" },
  { name: "블로그", href: "/blog" },
  { name: "대시보드", href: "/dashboard" },
  { name: "에디터", href: "/editor" },
] as const;

const LogoMark = () => (
  <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#3182F6] to-[#6366F1] flex items-center justify-center shrink-0">
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7L6 10.5L11.5 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const LogoMarkSm = () => (
  <div className="w-7 h-7 rounded-[9px] bg-gradient-to-br from-[#3182F6] to-[#6366F1] flex items-center justify-center shrink-0">
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
      <path
        d="M2.5 7L6 10.5L11.5 3.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  /**
   * 하이드레이션 전략:
   *
   * ① scrolled className 불일치
   *    → <header>에 suppressHydrationWarning 적용.
   *      SSR은 항상 non-scrolled HTML을 내보내고,
   *      클라이언트가 마운트 직후 scroll 위치를 읽어 필요하면 업데이트.
   *      suppressHydrationWarning이 있으면 React가 className 차이를 경고 없이 무시.
   *
   * ② setIsMounted를 effect 안에서 동기 호출 → cascading renders 경고
   *    → isMounted state 제거. 대신 useRef로 마운트 여부 추적.
   *      Sheet는 항상 렌더하되 open state는 클라이언트에서만 제어됨.
   *      (Sheet가 SSR에서 portal을 생성하지 않으므로 실제 불일치 없음)
   *
   * ③ onScroll 즉시 호출 → effect 내 동기 setState
   *    → requestAnimationFrame으로 한 프레임 뒤에 실행해 cascading 방지.
   */
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    const onScroll = () => {
      if (mountedRef.current) setScrolled(window.scrollY > 20);
    };

    // 진입 시 즉시 체크 — rAF로 감싸 effect body 내 동기 setState 경고 회피
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
          ? "bg-white/90 backdrop-blur-xl border-b border-ink-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-280 mx-auto px-6 h-16 flex items-center justify-between">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <LogoMark />
          <span className="text-[17px] font-bold text-ink-900 tracking-[-0.3px]">
            포트폴리오포지
          </span>
        </Link>

        {/* 데스크탑 네비게이션 */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <Button
              key={item.name}
              variant="ghost"
              asChild
              className="px-3.5 py-2 rounded-xl text-[15px] font-medium text-ink-500 hover:text-ink-900 hover:bg-black/4 transition-all duration-200"
            >
              <Link href={item.href}>{item.name}</Link>
            </Button>
          ))}
        </nav>

        {/* 데스크탑 CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="outline"
            asChild
            className="px-3.5 py-2 rounded-xl text-[15px] font-medium text-ink-500 hover:text-ink-900 hover:bg-black/4 transition-all duration-200"
          >
            <Link href="/login">로그인</Link>
          </Button>
          <Button asChild className="px-5 py-3.5">
            <Link href="/login">
              <Github size={18} />
              GitHub로 시작하기
            </Link>
          </Button>
        </div>

        {/* 모바일 햄버거 */}
        <div className="flex md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl text-ink-500 hover:text-ink-900 hover:bg-black/4"
                aria-label="메뉴 열기"
              >
                <Menu size={22} />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-75 p-0 flex flex-col bg-white border-l border-ink-100 shadow-[-8px_0_32px_rgba(0,0,0,0.08)]"
            >
              {/* 헤더 — 로고 */}
              <SheetHeader className="px-5 h-16 flex-row items-center border-b border-ink-100 space-y-0">
                <SheetTitle asChild>
                  <Link
                    href="/"
                    className="flex items-center gap-2 no-underline"
                    onClick={() => setOpen(false)}
                  >
                    <LogoMarkSm />
                    <span className="text-[16px] font-bold text-ink-900 tracking-[-0.3px]">
                      포트폴리오포지
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              {/* 네비게이션 링크 */}
              <nav className="flex-1 flex flex-col overflow-y-auto py-2">
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center justify-between mx-2 px-4 py-3.5 rounded-2xl text-[16px] font-medium text-ink-800 hover:bg-[#F9FAFB] active:bg-[#F3F4F6] transition-colors duration-150 no-underline"
                  >
                    {item.name}
                    <ChevronRight
                      size={16}
                      className="text-ink-300 group-hover:text-ink-500 transition-colors"
                    />
                  </Link>
                ))}
              </nav>

              {/* 하단 CTA */}
              <div className="px-4 pb-8 pt-3 border-t border-ink-100 flex flex-col gap-2.5">
                <CTAButton primary>
                  <Github size={18} />
                  GitHub로 시작하기
                  <ArrowRight size={16} />
                </CTAButton>
                <Button
                  asChild
                  variant="ghost"
                  className="w-full h-11 rounded-2xl text-[15px] font-medium text-ink-500 hover:text-ink-800 hover:bg-[#F3F4F6] transition-colors duration-200"
                >
                  <Link href="/login" onClick={() => setOpen(false)}>
                    이미 계정이 있으신가요?&nbsp;
                    <span className="text-[#3182F6] font-semibold">로그인</span>
                  </Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
