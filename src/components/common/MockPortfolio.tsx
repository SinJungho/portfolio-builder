"use client";

import { useEffect, useRef, useState } from "react";
import type { ThemeInput } from "react-activity-calendar";
import { GitHubCalendar } from "react-github-calendar";

const PROJECTS = [
  { name: "AI Portfolio Builder", stars: "128", color: "#1ed760" },
  { name: "Design System Kit", stars: "89", color: "#b3b3b3" },
  { name: "Real-time Dashboard", stars: "64", color: "#1ed760" },
  { name: "Open Graph Studio", stars: "47", color: "#539df5" },
];

const TECH_TAGS = ["React", "TypeScript", "Next.js", "Tailwind"];

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
      <div className="p-8 sm:p-12 bg-spotify-near-black min-h-[400px]">
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 mb-12">
          <div className="shrink-0 flex flex-col items-center lg:items-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-spotify-mid-dark border-4 border-spotify-dark-surface shadow-spotify-md mb-6 overflow-hidden">
               <div className="w-full h-full bg-gradient-to-br from-spotify-green to-spotify-green-border opacity-80 flex items-center justify-center text-black font-black text-2xl">KJ</div>
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2 tracking-tight">
                김재민
              </h3>
              <p className="text-[14px] font-bold text-spotify-green uppercase tracking-spotify mb-6">
                Frontend Engineer · Seoul
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                {TECH_TAGS.map((t) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/5 border border-white/10 text-spotify-silver uppercase tracking-spotify-wide"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROJECTS.map((p) => (
              <div
                key={p.name}
                className="rounded-2xl p-5 bg-spotify-dark-surface border border-white/5 hover:bg-spotify-mid-dark transition-colors group"
              >
                <div className="text-[15px] font-bold text-white mb-3 flex justify-between items-center">
                  {p.name}
                  <div
                    className="w-2 h-2 rounded-full shadow-[0_0_8px_rgba(30,215,96,0.5)]"
                    style={{ background: p.color }}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-bold text-spotify-silver uppercase tracking-spotify">
                    ⭐ {p.stars} Stars
                  </span>
                  <div className="h-1 w-1 rounded-full bg-white/10" />
                  <span className="text-[12px] font-bold text-spotify-green opacity-0 group-hover:opacity-100 transition-opacity">
                    View Project
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── GitHub 기여도 캘린더 ── */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="text-[13px] font-bold text-white uppercase tracking-spotify">
              최근 1년 기여도
            </div>
            <div className="text-[11px] font-bold text-spotify-silver uppercase tracking-spotify-wide">
              Total 1,428 Contributions
            </div>
          </div>
          <div ref={wrapperRef} className="w-full overflow-hidden p-6 rounded-2xl bg-spotify-dark-surface border border-white/5">
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
        </div>
      </div>
    </div>
  );
}
