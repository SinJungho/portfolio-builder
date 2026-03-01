"use client";

import { cn } from "@/lib/utils";
import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const NAV_LINKS = ["기능", "가격", "템플릿", "블로그"] as const;

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/90 backdrop-blur-xl border-b border-ink-100 shadow-[0_1px_0_rgba(0,0,0,0.06)]"
          : "bg-transparent border-b border-transparent",
      )}
    >
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 no-underline">
          <div className="w-8 h-8 rounded-[10px] bg-gradient-to-br from-[#3182F6] to-[#6366F1] flex items-center justify-center flex-shrink-0">
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
          <span className="text-[17px] font-bold text-ink-900 tracking-[-0.3px]">
            포트폴리오포지
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((item) => (
            <a
              key={item}
              href={item === "가격" ? "#pricing" : "#"}
              className="px-3.5 py-2 rounded-xl text-[15px] font-medium text-ink-500 hover:text-ink-900 hover:bg-black/[0.04] transition-all duration-200 no-underline"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link
            href="#"
            className="hidden md:block text-[14px] font-medium text-ink-500 hover:text-ink-900 transition-colors no-underline"
          >
            로그인
          </Link>
          <Link
            href="#"
            className="btn-pill-primary text-sm px-5 py-2.5 no-underline"
          >
            <Github size={15} />
            무료로 시작하기
          </Link>
        </div>
      </div>
    </header>
  );
}
