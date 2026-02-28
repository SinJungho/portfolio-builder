"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const menus = [
    { label: "기능", href: "/features" },
    { label: "가격", href: "/pricing" },
    { label: "템플릿", href: "/templates" },
    { label: "블로그", href: "/blog" },
  ];

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-[100]
        transition-all duration-300
        ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-b border-black/5"
            : "bg-transparent border-b border-transparent"
        }
      `}
    >
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] bg-[linear-gradient(135deg,#3182F6,#8B5CF6)] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8L7 12L13 4"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <span className="text-[17px] font-bold text-[#191F28] tracking-[-0.3px]">
            포트폴리오포지
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {menus.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="
                px-3.5 py-2 rounded-lg
                text-[15px] font-medium
                text-gray-500
                transition-colors duration-200
                hover:text-[#191F28]
                hover:bg-black/5
              "
            >
              {item.label}
            </Link>
          ))}

          {/* CTA */}
          <Link
            href="/editor"
            className="
              ml-2 px-5 py-2.5
              rounded-full
              bg-[#191F28]
              text-white
              text-[15px] font-semibold
              flex items-center gap-1.5
              transition-all duration-200
              hover:bg-[#3182F6]
              active:scale-[0.98]
            "
          >
            <Github size={15} />
            무료로 시작하기
          </Link>
        </nav>
      </div>
    </header>
  );
}
