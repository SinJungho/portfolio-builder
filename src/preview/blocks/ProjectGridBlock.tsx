"use client";

import { ArrowUpRight, Calendar, Code2, Star } from "lucide-react";
import Link from "next/link";
import React from "react";
import { parseProjectSummary } from "../project-summary";
import type { ThemeTokens } from "../themes";

interface ProjectGridBlockProps {
  config: {
    project_ids: string[];
    custom_descriptions?: Record<string, string>;
    projectsData?: Array<{
      id: string;
      name: string;
      description: string | null;
      ai_summary: string | null;
      ai_tags: string[];
      html_url: string | null;
      language: string | null;
      stargazers_count: number;
      pushed_at: Date | string | null;
    }>;
  };
  theme: ThemeTokens;
  portfolioId?: string;
  blockId?: string;
  isCompactPreview?: boolean;
}

export default function ProjectGridBlock({
  config,
  theme: t,
  portfolioId,
  blockId,
  isCompactPreview = false,
}: ProjectGridBlockProps) {
  const { projectsData = [] } = config;

  // 선택된 프로젝트의 순서를 유지한다.
  const displayProjects = projectsData;

  return (
    <section id="projects" className="space-y-12">
      <div className="space-y-4">
        <div className="flex items-end gap-4">
          <h2
            className="text-[28px] md:text-[36px] font-extrabold tracking-[-1px] leading-none"
            style={{ color: t.text }}
          >
            대표 프로젝트
          </h2>
          {displayProjects.length > 0 && (
            <span
              className="text-[14px] font-semibold mb-1"
              style={{ color: t.textMuted }}
            >
              {displayProjects.length}개 프로젝트
            </span>
          )}
        </div>
        <p className="text-[13px] leading-relaxed" style={{ color: t.textMuted }}>
          GitHub에서 고른 작업을 채용 담당자에게 먼저 보여줘요.
        </p>
      </div>

      {/* 프로젝트가 없을 때 공개 페이지용 빈 상태를 표시한다. */}
      {displayProjects.length === 0 && (
        <div
          className="px-6 py-12 text-center"
          style={{
            backgroundColor: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: t.cardRadius,
          }}
        >
          <p
            className="text-[15px] font-semibold"
            style={{ color: t.textMuted }}
          >
            아직 공개된 프로젝트가 없어요.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {displayProjects.map((p, i) => (
          <ProjectRow
            key={p.id}
            project={p}
            index={i}
            theme={t}
            customDescription={config.custom_descriptions?.[p.id]}
            portfolioId={portfolioId}
            blockId={blockId}
            isCompactPreview={isCompactPreview}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectRow({
  project: p,
  index,
  theme: t,
  customDescription,
  portfolioId,
  blockId,
  isCompactPreview,
}: {
  project: NonNullable<ProjectGridBlockProps["config"]["projectsData"]>[0];
  index: number;
  theme: ThemeTokens;
  customDescription?: string;
  portfolioId?: string;
  blockId?: string;
  isCompactPreview: boolean;
}) {
  const { headline, highlights, demo_url, role } = parseProjectSummary(p.ai_summary);
  const year = p.pushed_at ? new Date(p.pushed_at).getFullYear() : null;
  const normalizedCustomDescription = customDescription?.trim() ? customDescription : undefined;
  const outcome =
    normalizedCustomDescription || headline || highlights[0] || p.description;
  const primaryUrl = demo_url || p.html_url;
  const primaryLabel = demo_url ? "데모 보기" : "GitHub 보기";
  // 첫 프로젝트만 대표작으로 강조한다.
  const isFlagship = index === 0;
  // 대표작에는 중복을 제외한 하이라이트를 최대 2개 표시한다.
  const extraHighlights = isFlagship
    ? highlights.filter((h) => h.trim() !== "" && h !== outcome).slice(0, 2)
    : [];

  const trackClick = async () => {
    if (!portfolioId || !blockId) return;
    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "block_click",
          portfolio_id: portfolioId,
          block_id: blockId,
        }),
      });
    } catch (e) {
      console.error("Failed to track project click:", e);
    }
  };

  const rowClass = `group flex ${isCompactPreview ? "flex-col gap-3 px-4 py-4" : "flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center md:px-6"} transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.12] focus-visible:outline-2 focus-visible:outline-offset-4`;
  const rowStyle: React.CSSProperties = {
    backgroundColor: t.cardBg,
    border: `1px solid ${t.cardBorder}`,
    borderRadius: t.cardRadius,
    outlineColor: t.accent,
  };

  const body = (
    <>
      <div className="w-full flex flex-1 min-w-0">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3
              className={`${isCompactPreview ? "text-[18px]" : "text-[20px] md:text-[24px]"} font-extrabold tracking-[-1px] leading-tight break-words`}
              style={{ color: t.text }}
            >
              {p.name}
            </h3>
            {role && (
              <span
                className="text-[13px] font-semibold"
                style={{ color: t.textMuted }}
              >
                · {role}
              </span>
            )}
          </div>
          {outcome && (
            <p
              className={`${isCompactPreview ? "text-[14px]" : "text-[15px]"} leading-relaxed line-clamp-2 max-w-2xl`}
              style={{ color: t.textMuted }}
            >
              {outcome}
            </p>
          )}
          {extraHighlights.length > 0 && (
            <ul className="space-y-1 pt-1 max-w-2xl">
              {extraHighlights.map((h, hi) => (
                <li
                  key={hi}
                  className="flex gap-2.5 text-[14px] leading-relaxed"
                  style={{ color: t.textMuted }}
                >
                  <span aria-hidden="true" className="shrink-0 select-none">
                    ·
                  </span>
                  <span className="min-w-0">{h}</span>
                </li>
              ))}
            </ul>
          )}
          <div
            className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-0.5 text-[12px] font-semibold"
            style={{ color: t.textMuted }}
          >
            {p.language && (
              <span className="inline-flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                {p.language}
              </span>
            )}
            {year && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {year}
              </span>
            )}
            {p.stargazers_count > 0 && (
              <span className="inline-flex items-center gap-1">
                <Star
                  className="w-3 h-3"
                  style={{ fill: t.textMuted, color: t.textMuted }}
                />
                {p.stargazers_count}
              </span>
            )}
          </div>
        </div>
      </div>

      {primaryUrl && (
        <span
          className={`${isFlagship ? "" : "pf-cta-badge "}inline-flex items-center justify-center gap-1.5 shrink-0 self-start ${isCompactPreview ? "px-3 py-2" : "px-4 py-2 sm:self-center"} text-[13px] font-bold rounded-full transition-all group-hover:translate-x-0.5`}
          style={
            isFlagship
              ? { backgroundColor: t.ctaBg, color: t.ctaText }
              : ({
                  backgroundColor: t.cardBg,
                  color: t.text,
                  border: `1px solid ${t.cardBorder}`,
                  "--cta-badge-bg-active": t.ctaBg,
                  "--cta-badge-fg-active": t.ctaText,
                } as React.CSSProperties)
          }
        >
          {primaryLabel}
          <ArrowUpRight className="w-4 h-4" />
        </span>
      )}
    </>
  );

  return primaryUrl ? (
    <Link
      href={primaryUrl}
      target="_blank"
      rel="noreferrer"
      onClick={trackClick}
      className={rowClass}
      style={rowStyle}
      // 링크 이름에 프로젝트 요약과 이동 동작을 포함한다.
      aria-label={
        outcome
          ? `${p.name}, ${outcome.slice(0, 100)}, ${primaryLabel}`
          : `${p.name}, ${primaryLabel}`
      }
    >
      {body}
    </Link>
  ) : (
    <div className={rowClass} style={rowStyle}>
      {body}
    </div>
  );
}
