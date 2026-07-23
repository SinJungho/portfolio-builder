"use client";

import { Activity, Clock3, Code2, FolderGit2, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ThemeInput } from "react-activity-calendar";
import { GitHubCalendar } from "react-github-calendar";

const PROJECTS = [
  { name: "AI 포트폴리오 빌더", stars: "128", language: "TypeScript", updatedAt: "3시간 전", languageColor: "#3178c6" },
  { name: "디자인 시스템 키트", stars: "89", language: "React", updatedAt: "어제", languageColor: "#61dafb" },
  { name: "실시간 데이터 대시보드", stars: "64", language: "Next.js", updatedAt: "3일 전", languageColor: "#f5f5f5" },
  { name: "오픈 그래프 스튜디오", stars: "47", language: "TypeScript", updatedAt: "지난주", languageColor: "#3178c6" },
];

const TECH_STACKS = [
  { name: "React", color: "#61dafb" },
  { name: "TypeScript", color: "#3178c6" },
  { name: "Next.js", color: "#f5f5f5" },
  { name: "Tailwind", color: "#38bdf8" },
];

const SPOTIFY_THEME: ThemeInput = {
  dark: [
    "#1f1f1f",
    "rgba(30,215,96,0.15)",
    "rgba(30,215,96,0.40)",
    "rgba(30,215,96,0.70)",
    "#1ed760",
  ],
};

function calcBlockSize(containerWidth: number): number {
  const margin = 2;
  const weeks = 53;
  const size = Math.floor((containerWidth + margin) / weeks) - margin;
  return Math.min(12, Math.max(4, size));
}

function StackLabel({ name, color }: { name: string; color: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 border-l-[3px] bg-white/[0.08] px-2.5 py-1.5 font-mono text-[11px] font-semibold tracking-[0.01em] text-spotify-near-white"
      style={{ borderLeftColor: color }}
    >
      <Code2 size={13} aria-hidden="true" style={{ color }} />
      {name}
    </span>
  );
}

export default function MockPortfolio() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [blockSize, setBlockSize] = useState(9);
  const [calKey, setCalKey] = useState(0);
  const [mounted, setMounted] = useState(false);
  const prevSizeRef = useRef(9);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0].contentRect.width;
      if (!width) return;

      const next = calcBlockSize(width);
      if (next !== prevSizeRef.current) {
        prevSizeRef.current = next;
        setBlockSize(next);
        setCalKey((k) => k + 1);
      }
    });

    observer.observe(el);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative max-w-[840px] mx-auto rounded-3xl overflow-hidden shadow-spotify bg-spotify-near-black border border-white/5">
      {/* 브라우저 상단 바 */}
      <div className="flex items-center gap-3 px-6 py-4 bg-spotify-dark-surface border-b border-white/5">
        <div className="flex gap-2">
          {["#f3727f", "#ffa42b", "#1ed760"].map((c) => (
            <div
              key={c}
              style={{ background: c }}
              className="w-3 h-3 rounded-full opacity-80"
            />
          ))}
        </div>
        <div className="flex-1 bg-spotify-near-black border border-white/5 rounded-full px-4 py-1.5 text-[12px] text-spotify-silver font-medium text-center">
          portfolioforge.app/jaemin-dev
        </div>
      </div>

      {/* 포트폴리오 바디 */}
      <div className="min-h-[400px] bg-spotify-near-black p-8 sm:p-10 lg:p-12">
        <div className="mb-12 grid gap-10 lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-9">
          <aside className="flex flex-col items-center text-center lg:border-r lg:border-white/10 lg:pr-9 lg:text-left">
            <div className="mb-5 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-4 border-spotify-dark-surface bg-gradient-to-br from-spotify-green to-spotify-green-border text-2xl font-black text-black shadow-spotify-md sm:h-24 sm:w-24">
              KJ
            </div>
            <h3 className="text-2xl font-black leading-tight tracking-tight text-white sm:text-3xl">김재민</h3>
            <p className="mt-2 flex items-center gap-1.5 text-[12px] font-bold tracking-[0.08em] text-spotify-green sm:text-[13px]">
              <Code2 size={14} aria-hidden="true" />
              프론트엔드 개발자
            </p>
            <div className="mt-6 flex max-w-[12rem] flex-wrap justify-center gap-1.5 lg:justify-start" aria-label="개발 기술 스택">
              {TECH_STACKS.map((stack) => (
                <StackLabel key={stack.name} {...stack} />
              ))}
            </div>
          </aside>

          <section className="min-w-0" aria-labelledby="featured-repositories-title">
            <div className="mb-4 flex items-center gap-2">
              <FolderGit2 size={17} className="text-spotify-green" aria-hidden="true" />
              <h4 id="featured-repositories-title" className="text-[13px] font-bold tracking-[0.08em] text-white">
                대표 리포지토리
              </h4>
              <span className="text-[11px] font-medium text-spotify-silver">4개</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {PROJECTS.map((project) => (
                <article
                  key={project.name}
                  className="group rounded-2xl border border-white/5 bg-spotify-dark-surface p-4 transition-colors duration-300 hover:border-white/10 hover:bg-spotify-mid-dark"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h5 className="text-[14px] font-bold leading-snug text-white">{project.name}</h5>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 border-l-2 bg-white/[0.035] px-1.5 py-1 font-mono text-[9px] font-medium text-spotify-silver"
                      style={{ borderLeftColor: project.languageColor }}
                    >
                      <Code2 size={11} aria-hidden="true" style={{ color: project.languageColor }} />
                      {project.language}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-spotify-silver">
                    <span className="inline-flex items-center gap-1.5 text-spotify-near-white">
                      <Star size={13} className="text-spotify-warning" aria-hidden="true" />
                      {project.stars}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 border-t border-white/5 pt-3 text-[11px] font-medium text-spotify-silver/80">
                    <Clock3 size={13} aria-hidden="true" />
                    <span>최근 업데이트 {project.updatedAt}</span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* ── GitHub 기여도 캘린더 ── */}
        <section className="border-t border-white/10 pt-7 sm:pt-8" aria-labelledby="contribution-title">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-spotify-green">
                <Activity size={16} aria-hidden="true" />
                <h4 id="contribution-title" className="text-[13px] font-bold tracking-[0.06em] text-white">
                  최근 1년의 기여 활동
                </h4>
              </div>
              <p className="mt-1 text-[11px] font-medium text-spotify-silver">
                코드와 프로젝트에 남긴 기록
              </p>
            </div>
            <div className="shrink-0 border-l-2 border-spotify-green pl-3 text-right">
              <p className="text-[10px] font-medium tracking-[0.08em] text-spotify-silver">총 기여</p>
              <p className="mt-0.5 text-lg font-black leading-none tracking-tight text-white">
                1,428<span className="ml-1 text-[11px] font-bold text-spotify-silver">회</span>
              </p>
            </div>
          </div>
          <div ref={wrapperRef} className="w-full overflow-hidden rounded-2xl border border-white/5 bg-spotify-dark-surface p-4 sm:p-5">
            {mounted && (
              <GitHubCalendar
                key={calKey}
                username="torvalds"
                colorScheme="dark"
                theme={SPOTIFY_THEME}
                blockSize={blockSize}
                blockMargin={2}
                fontSize={9}
                showColorLegend={false}
                showTotalCount={false}
                style={{ color: "#b3b3b3", width: "100%", maxWidth: "100%" }}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
