"use client";

import type { ThemeInput } from "react-activity-calendar";
import { GitHubCalendar } from "react-github-calendar";

const PROJECTS = [
  { name: "AI Portfolio Builder", stars: "128", color: "#3182F6" },
  { name: "Design System Kit", stars: "89", color: "#6366F1" },
  { name: "Real-time Dashboard", stars: "64", color: "#10B981" },
  { name: "Open Graph Studio", stars: "47", color: "#F59E0B" },
];

const TECH_TAGS = ["React", "TypeScript", "Next.js", "Tailwind"];

const DARK_THEME: ThemeInput = {
  dark: [
    "#1E293B",
    "rgba(49,130,246,0.25)",
    "rgba(49,130,246,0.50)",
    "rgba(49,130,246,0.78)",
    "#3182F6",
  ],
};

export default function MockPortfolio() {
  return (
    <div className="relative max-w-[760px] mx-auto rounded-[20px] overflow-hidden shadow-portrait bg-white">
      {/* 브라우저 상단 바 */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F3F4F6] border-b border-[#E5E7EB]">
        <div className="flex gap-1.5">
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <div
              key={c}
              style={{ background: c }}
              className="w-3 h-3 rounded-full"
            />
          ))}
        </div>
        <div className="flex-1 bg-white border border-[#E5E7EB] rounded-lg px-3 py-1 text-[11px] text-ink-300 ml-2 font-mono">
          portfolioforge.dev/kim-jaemin
        </div>
      </div>

      {/* 포트폴리오 바디 */}
      <div className="p-8 bg-[#0F172A] min-h-[360px]">
        {/*
          반응형 레이아웃:
            - mobile/tablet (< lg): 세로 스택 — 프로필 → 태그 → 프로젝트 그리드
            - desktop (lg+): 원본 flex — 프로필(좌) + 프로젝트 그리드(우) 나란히
        */}

        {/* ── mobile/tablet: 세로 스택 ── */}
        <div className="lg:hidden">
          {/* 프로필 헤더 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#3182F6] to-[#6366F1] flex-shrink-0" />
            <div>
              <div className="text-[20px] font-bold text-white leading-tight">
                김재민
              </div>
              <div className="text-[13px] text-slate-500 mt-0.5">
                Frontend Engineer · Seoul
              </div>
            </div>
          </div>
          {/* 언어 스택 태그 */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {TECH_TAGS.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                style={{
                  background: "rgba(49,130,246,0.15)",
                  color: "#60A5FA",
                }}
              >
                {t}
              </span>
            ))}
          </div>
          {/* 프로젝트 2×2 그리드 */}
          <div className="grid grid-cols-2 gap-2.5 mb-6">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-[12px] font-semibold text-white mb-2">
                  {p.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: p.color }}
                  />
                  <span className="text-[11px] text-slate-500">
                    ⭐ {p.stars}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── desktop: 원본 flex 레이아웃 ── */}
        <div className="hidden lg:flex gap-6 mb-6">
          {/* 프로필 */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#3182F6] to-[#6366F1] mb-4" />
            <div className="text-[20px] font-bold text-white leading-tight">
              김재민
            </div>
            <div className="text-[13px] text-slate-500 mt-0.5 mb-4">
              Frontend Engineer · Seoul
            </div>
            <div className="flex flex-wrap gap-1.5">
              {TECH_TAGS.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{
                    background: "rgba(49,130,246,0.15)",
                    color: "#60A5FA",
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
          {/* 프로젝트 카드 2×2 */}
          <div className="flex-1 grid grid-cols-2 gap-2.5">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="rounded-xl p-3.5"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-[12px] font-semibold text-white mb-2">
                  {p.name}
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: p.color }}
                  />
                  <span className="text-[11px] text-slate-500">
                    ⭐ {p.stars}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GitHub 기여도 캘린더 */}
        <div>
          <div className="text-[11px] text-slate-600 mb-3 font-medium">
            최근 1년 기여도
          </div>
          <GitHubCalendar
            username="torvalds"
            colorScheme="dark"
            theme={DARK_THEME}
            blockSize={9}
            blockMargin={2}
            fontSize={9}
            showColorLegend={false}
            showTotalCount={false}
            style={{ color: "#475569" }}
          />
        </div>
      </div>
    </div>
  );
}
