"use client";

import { Github } from "lucide-react";
import { useEffect, useState } from "react";
export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: scrolled ? "rgba(255,255,255,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(0,0,0,0.06)"
          : "1px solid transparent",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: 1120,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: "linear-gradient(135deg, #3182F6, #8B5CF6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
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
          <span
            style={{
              fontSize: 17,
              fontWeight: 700,
              color: "#191F28",
              letterSpacing: "-0.3px",
            }}
          >
            포트폴리오포지
          </span>
        </div>

        {/* Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {["기능", "가격", "템플릿", "블로그"].map((item) => (
            <a
              key={item}
              href="#"
              style={{
                padding: "8px 14px",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 500,
                color: "#6B7280",
                textDecoration: "none",
                transition: "color 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.color = "#191F28";
                (e.target as HTMLElement).style.background = "rgba(0,0,0,0.04)";
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.color = "#6B7280";
                (e.target as HTMLElement).style.background = "transparent";
              }}
            >
              {item}
            </a>
          ))}
          <a
            href="#"
            style={{
              marginLeft: 8,
              padding: "10px 20px",
              borderRadius: 50,
              background: "#191F28",
              color: "white",
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
              transition: "background 0.2s, transform 0.2s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.background = "#3182F6";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.background = "#191F28";
            }}
          >
            <Github size={15} />
            무료로 시작하기
          </a>
        </nav>
      </div>
    </header>
  );
}
