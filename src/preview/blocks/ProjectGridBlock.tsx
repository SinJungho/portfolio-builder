"use client";

import React from "react";
import { ArrowUpRight, Code2 } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface ProjectGridBlockProps {
  config: {
    layout: "grid" | "list" | "masonry";
    columns: number;
    project_ids: string[];
    show_tech_stack: boolean;
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
}

const LANG_COLORS: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3776AB",
  Rust: "#DEA584",
  Go: "#00ADD8",
  Java: "#ED8B00",
  "C++": "#00599C",
  Ruby: "#CC342D",
  Swift: "#F05138",
  Kotlin: "#7F52FF",
  PHP: "#777BB4",
  HTML: "#E34F26",
  CSS: "#1572B6",
  Shell: "#89E051",
  Dart: "#0175C2",
};

function parseSummary(summary: string | null) {
  if (!summary) return { headline: null, highlights: [], demo_url: null, role: null };
  try {
    const trimmed = summary.trim();
    if (trimmed.startsWith("{")) {
      const data = JSON.parse(trimmed);
      return {
        headline: data.headline || null,
        highlights: Array.isArray(data.highlights) ? data.highlights : [],
        demo_url: data.demo_url || null,
        role: data.role || null
      };
    }
  } catch {
    // Fallback
  }
  return { headline: summary, highlights: [], demo_url: null, role: null };
}

export default function ProjectGridBlock({ config, theme: t }: ProjectGridBlockProps) {
  const { project_ids, show_tech_stack, projectsData = [] } = config;

  const displayProjects =
    projectsData.length > 0
      ? projectsData
      : project_ids.map((id, index) => ({
          id,
          name: `Project ${index + 1}`,
          description: "A sample project description.",
          ai_summary: "AI-generated summary of the project with key highlights.",
          ai_tags: ["React", "TypeScript", "Next.js"],
          html_url: "#",
          language: "TypeScript",
          stargazers_count: 0,
        }));

  const { ref: headerRef, style: headerStyle } = useScrollReveal("fadeUp");

  const featured = displayProjects[0];
  const rest = displayProjects.slice(1);

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div ref={headerRef} style={headerStyle} className="space-y-4">
        <div className="flex items-end gap-4">
          <h2
            className="text-[28px] md:text-[36px] font-extrabold tracking-[-2px] leading-none"
            style={{ color: t.text }}
          >
            Featured Projects
          </h2>
          <span
            className="text-[14px] font-semibold mb-1"
            style={{ color: t.textMuted }}
          >
            {displayProjects.length} projects
          </span>
        </div>
        <div
          className="h-[3px] w-12 rounded-full"
          style={{ background: t.decorBar }}
        />
      </div>

      {/* Featured Project — Full Width */}
      {featured && (
        <FeaturedCard 
          project={featured} 
          theme={t} 
          showTech={show_tech_stack} 
          customDescription={config.custom_descriptions?.[featured.id]}
        />
      )}

      {/* Secondary Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((p, i) => (
            <SecondaryCard 
              key={p.id} 
              project={p} 
              index={i + 1} 
              theme={t} 
              showTech={show_tech_stack} 
              customDescription={config.custom_descriptions?.[p.id]}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Featured Card ── */
function FeaturedCard({
  project: p,
  theme: t,
  showTech,
  customDescription,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  theme: ThemeTokens;
  showTech: boolean;
  customDescription?: string;
}) {
  const { ref: revealRef, style: revealStyle } = useScrollReveal<HTMLDivElement>("fadeUp", {
    delay: 200,
  });
  const langColor = LANG_COLORS[p.language || ""] || t.accent;
  const { headline, highlights, demo_url } = parseSummary(p.ai_summary);
  const year = p.pushed_at ? new Date(p.pushed_at).getFullYear() : null;

  return (
    <div
      ref={revealRef}
      style={{
        ...revealStyle,
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.cardRadius,
        boxShadow: t.cardShadow,
      }}
      className="group relative block p-8 md:p-10 transition-all duration-500 overflow-hidden"
    >
      <div className="relative flex flex-col md:flex-row gap-10">
        <div className="flex-1 space-y-6">
          {/* Metadata Row */}
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            <span className="text-[13px] font-bold" style={{ color: t.textMuted }}>
              {p.language || "Unknown"}
            </span>
            {year && (
              <>
                <span className="mx-1" style={{ color: t.cardBorder }}>·</span>
                <span className="text-[13px] font-semibold" style={{ color: t.textMuted }}>
                  {year}
                </span>
              </>
            )}
            <span className="mx-1" style={{ color: t.cardBorder }}>·</span>
            <span className="text-[13px] font-semibold flex items-center gap-1" style={{ color: t.textMuted }}>
              ★ {p.stargazers_count}
            </span>
          </div>

          <div className="space-y-2">
            <h3
              className="text-[26px] md:text-[32px] font-extrabold tracking-[-1.8px] leading-tight"
              style={{ color: t.text }}
            >
              {p.name}
            </h3>
            {headline && (
              <p className="text-[18px] font-semibold leading-tight" style={{ color: t.accent }}>
                {headline}
              </p>
            )}
          </div>

          <div 
            className={`space-y-4 prose prose-sm max-w-none md:prose-base ${t.id === "midnight" ? "prose-invert" : "prose-slate"}`} 
            style={{ color: t.textMuted }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {customDescription || p.description || ""}
            </ReactMarkdown>

            {highlights.length > 0 && (
              <ul className="space-y-2">
                {highlights.map((h: string, i: number) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed" style={{ color: t.text }}>
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: t.accent }} />
                    {h}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {showTech && p.ai_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {p.ai_tags.slice(0, 8).map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-md uppercase tracking-wider"
                  style={{ backgroundColor: t.tagBg, color: t.tagText }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              href={p.html_url || "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: t.accent, color: "#fff" }}
            >
              <Code2 className="w-4 h-4" />
              GitHub
            </Link>
            {demo_url && (
              <Link
                href={demo_url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-[14px] font-bold border transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ borderColor: t.cardBorder, color: t.text, backgroundColor: t.cardBg }}
              >
                <ArrowUpRight className="w-4 h-4" />
                Live Demo
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Secondary Card ── */
function SecondaryCard({
  project: p,
  index,
  theme: t,
  showTech,
  customDescription,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  index: number;
  theme: ThemeTokens;
  showTech: boolean;
  customDescription?: string;
}) {
  const { ref: revealRef, style: revealStyle } = useScrollReveal<HTMLAnchorElement>("fadeUp", {
    delay: index * 100,
  });
  const langColor = LANG_COLORS[p.language || ""] || t.accent;
  const { headline } = parseSummary(p.ai_summary);
  const year = p.pushed_at ? new Date(p.pushed_at).getFullYear() : null;

  return (
    <Link
      ref={revealRef}
      href={p.html_url || "#"}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col justify-between p-7 min-h-[260px] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.cardHoverBorder;
        e.currentTarget.style.boxShadow = t.cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.cardBorder;
        e.currentTarget.style.boxShadow = t.cardShadow;
      }}
      style={{
        ...revealStyle,
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.cardRadius,
        boxShadow: t.cardShadow,
      }}
    >
      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
            <span className="text-[12px] font-bold" style={{ color: t.textMuted }}>
              {p.language || "Unknown"}
            </span>
            {year && (
              <>
                <span className="mx-1 text-[10px]" style={{ color: t.cardBorder }}>·</span>
                <span className="text-[12px] font-semibold" style={{ color: t.textMuted }}>
                  {year}
                </span>
              </>
            )}
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ background: t.accentGradient }}
          >
            <ArrowUpRight size={14} color="#fff" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h3
            className="text-[19px] font-bold tracking-[-0.6px] leading-snug pr-8 transition-colors group-hover:text-accent"
            style={{ color: t.text }}
          >
            {p.name}
          </h3>
          {headline && (
            <p className="text-[14px] font-semibold line-clamp-1" style={{ color: t.accent }}>
              {headline}
            </p>
          )}
        </div>

        <div 
          className={`text-[14px] leading-relaxed prose prose-sm ${t.id === "midnight" ? "prose-invert" : "prose-slate"}`} 
          style={{ color: t.textMuted }}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {customDescription || p.description || ""}
          </ReactMarkdown>
        </div>
      </div>

      {/* Tags */}
      {showTech && p.ai_tags?.length > 0 && (
        <div className="relative flex flex-wrap gap-1.5 mt-6">
          {p.ai_tags.slice(0, 4).map((tag: string) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider"
              style={{ backgroundColor: t.tagBg, color: t.tagText }}
            >
              {tag}
            </span>
          ))}
          {p.ai_tags.length > 4 && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-md"
              style={{ backgroundColor: t.tagBg, color: t.textMuted }}
            >
              +{p.ai_tags.length - 4}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
