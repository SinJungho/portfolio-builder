"use client";

<<<<<<< HEAD
import { useEffect, useRef, useState } from "react";
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

/**
 * react-activity-calendar SVG width 계산식 (라이브러리 소스 기반):
 *   svgWidth = weeks × (blockSize + blockMargin) - blockMargin
 *
 * 역산:
 *   blockSize = floor((containerWidth + blockMargin) / weeks) - blockMargin
 *
 * GitHubCalendar는 최근 1년(53주 이하)을 렌더링.
 * 안전하게 weeks=53 기준으로 계산하고 최소 4 / 최대 12로 클램프.
 */
function calcBlockSize(containerWidth: number): number {
  const margin = 2;
  const weeks = 53;
  const size = Math.floor((containerWidth + margin) / weeks) - margin;
  return Math.min(12, Math.max(4, size));
}

export default function MockPortfolio() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  // blockSize만 state로 관리 (blockMargin은 항상 2로 고정)
  const [blockSize, setBlockSize] = useState(9);
  // blockSize 변경 시 GitHubCalendar를 재마운트해 새 props 반영
  const [calKey, setCalKey] = useState(0);
  const prevSizeRef = useRef(9);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (!width) return;

      const next = calcBlockSize(width);
      // 값이 실제로 바뀔 때만 state 업데이트 → 불필요한 리렌더 방지
      if (next !== prevSizeRef.current) {
        prevSizeRef.current = next;
        setBlockSize(next);
        setCalKey((k) => k + 1);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
        {/* ── mobile/tablet (< lg): 세로 스택 ── */}
        <div className="lg:hidden">
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

        {/* ── desktop (lg+): 원본 flex 레이아웃 ── */}
        <div className="hidden lg:flex gap-6 mb-6">
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
=======
import styles from "@/styles/MockPortfolio.module.css";
import { useState } from "react";

// 기여도 셀의 CSS 클래스명을 반환
function generateContributionClasses(): string[] {
  return Array.from({ length: 364 }).map(() => {
    const intensity = Math.random();
    if (intensity < 0.4) return styles.bgLevel0;
    if (intensity < 0.6) return styles.bgLevel1;
    if (intensity < 0.8) return styles.bgLevel2;
    return styles.bgLevel3;
  });
}

export default function MockPortfolio() {
  const [contributionClasses] = useState<string[]>(generateContributionClasses);

  return (
    <div className={styles.outerContainer}>
      {/* Mock browser bar */}
      <div className={styles.browserBar}>
        <div className={styles.browserDots}>
          <div className={`${styles.dot} ${styles.dotRed}`} />
          <div className={`${styles.dot} ${styles.dotYellow}`} />
          <div className={`${styles.dot} ${styles.dotGreen}`} />
        </div>
        <div className={styles.browserUrl}>portfolioforge.dev/kim-jaemin</div>
      </div>

      {/* Mock portfolio content */}
      <div className={styles.portfolioContent}>
        <div className={styles.profileProjectRow}>
          {/* 프로필 영역 */}
          <div className={styles.profileArea}>
            <div className={styles.avatar} />
            <div className={styles.userName}>김재민</div>
            <div className={styles.userRole}>Frontend Engineer · Seoul</div>
            <div className={styles.tagContainer}>
              {["React", "TypeScript", "Next.js", "Tailwind"].map((t) => (
                <span key={t} className={styles.tag}>
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
                  {t}
                </span>
              ))}
            </div>
          </div>
<<<<<<< HEAD
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
=======

          {/* 프로젝트 그리드 (2열) */}
          <div className={styles.projectsGrid}>
            {[
              { name: "AI Portfolio Builder", star: "128", lang: "#3182F6" },
              { name: "Design System Kit", star: "89", lang: "#8B5CF6" },
              { name: "Real-time Dashboard", star: "64", lang: "#10B981" },
              { name: "Open Graph Studio", star: "47", lang: "#F59E0B" },
            ].map((p) => (
              <div key={p.name} className={styles.projectCard}>
                <div className={styles.projectName}>{p.name}</div>
                <div className={styles.projectMeta}>
                  <div
                    className={styles.langDot}
                    style={{ backgroundColor: p.lang }}
                  />
                  <span className={styles.starText}>⭐ {p.star}</span>
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
                </div>
              </div>
            ))}
          </div>
        </div>

<<<<<<< HEAD
        {/* ── GitHub 기여도 캘린더 ── */}
        <div>
          <div className="text-[11px] text-slate-600 mb-3 font-medium">
            최근 1년 기여도
          </div>
          {/*
           * ref wrapper: ResizeObserver가 이 요소의 너비를 관찰.
           * overflow-hidden: SVG가 계산 오차로 1~2px 삐져나오는 것 방지.
           * key: blockSize 변경 시 GitHubCalendar 재마운트 → 새 blockSize 적용.
           *
           * GitHubCalendar props (react-github-calendar → react-activity-calendar):
           *   blockSize   : 셀 크기(px) — ResizeObserver로 컨테이너에 맞게 동적 계산
           *   blockMargin : 셀 간격(px) — 2로 고정
           *   showColorLegend={false}  : 하단 범례 숨김
           *   showTotalCount={false}   : "N contributions in ..." 텍스트 숨김
           *   showMonthLabels 기본값   : true (월 레이블 표시)
           */}
          <div ref={wrapperRef} className="w-full overflow-hidden">
            <GitHubCalendar
              key={calKey}
              username="torvalds"
              colorScheme="dark"
              theme={DARK_THEME}
              blockSize={blockSize}
              blockMargin={2}
              fontSize={9}
              showColorLegend={false}
              showTotalCount={false}
              style={{ color: "#475569", width: "100%", maxWidth: "100%" }}
            />
=======
        {/* 기여도 그래프 */}
        <div className={styles.graphSection}>
          <div className={styles.graphLabel}>최근 1년 기여도</div>
          <div className={styles.graphGrid}>
            {contributionClasses.map((cls, i) => (
              <div key={i} className={`${styles.graphCell} ${cls}`} />
            ))}
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
          </div>
        </div>
      </div>
    </div>
  );
}
