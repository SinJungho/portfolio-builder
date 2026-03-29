"use client";

import React from "react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface ProjectGridBlockProps {
  config: {
    layout: "grid" | "list" | "masonry";
    columns: number;
    project_ids: string[];
    show_tech_stack: boolean;
    projectsData?: Array<{
      id: string;
      name: string;
      description: string | null;
      ai_summary: string | null;
      ai_tags: string[];
      html_url: string | null;
      language: string | null;
      stargazers_count: number;
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

  const header = useScrollReveal("fadeUp");

  const featured = displayProjects[0];
  const rest = displayProjects.slice(1);

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div ref={header.ref} style={header.style} className="space-y-4">
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
      {featured && <FeaturedCard project={featured} index={0} theme={t} showTech={show_tech_stack} />}

      {/* Secondary Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rest.map((p, i) => (
            <SecondaryCard key={p.id} project={p} index={i + 1} theme={t} showTech={show_tech_stack} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ── Featured Card ── */
function FeaturedCard({
  project: p,
  index,
  theme: t,
  showTech,
}: {
  project: any;
  index: number;
  theme: ThemeTokens;
  showTech: boolean;
}) {
  const reveal = useScrollReveal<HTMLAnchorElement>("fadeUp", { delay: 100 });
  const num = String(index + 1).padStart(2, "0");
  const langColor = LANG_COLORS[p.language || ""] || t.accent;

  return (
    <Link
      ref={reveal.ref}
      href={p.html_url || "#"}
      target="_blank"
      rel="noreferrer"
      className="group relative block p-8 md:p-10 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.cardHoverBorder;
        e.currentTarget.style.boxShadow = t.cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.cardBorder;
        e.currentTarget.style.boxShadow = t.cardShadow;
      }}
      style={{
        ...reveal.style,
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.cardRadius,
        boxShadow: t.cardShadow,
      }}
    >
      {/* Number overlay */}
      <span
        className="absolute top-6 right-8 text-[80px] md:text-[120px] font-black leading-none select-none pointer-events-none"
        style={{ color: t.accent, opacity: 0.04 }}
      >
        {num}
      </span>

      <div className="relative flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-5">
          {/* Language dot */}
          <div className="flex items-center gap-2.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: langColor }}
            />
            <span className="text-[13px] font-bold" style={{ color: t.textMuted }}>
              {p.language || "Unknown"}
            </span>
            <span className="mx-1" style={{ color: t.cardBorder }}>·</span>
            <span className="text-[13px] font-semibold flex items-center gap-1" style={{ color: t.textMuted }}>
              ★ {p.stargazers_count}
            </span>
          </div>

          <h3
            className="text-[24px] md:text-[28px] font-extrabold tracking-[-1.5px] leading-tight"
            style={{ color: t.text }}
          >
            {p.name}
          </h3>

          <p
            className="text-[16px] leading-[1.75] line-clamp-3"
            style={{ color: t.textMuted }}
          >
            {p.ai_summary || p.description || "No description provided."}
          </p>

          {showTech && p.ai_tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {p.ai_tags.slice(0, 6).map((tag: string) => (
                <span
                  key={tag}
                  className="text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider"
                  style={{ backgroundColor: t.tagBg, color: t.tagText }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex items-center shrink-0">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
            style={{ background: t.accentGradient }}
          >
            <ArrowUpRight size={20} color="#fff" />
          </div>
        </div>
      </div>
    </Link>
  );
}

/* ── Secondary Card ── */
function SecondaryCard({
  project: p,
  index,
  theme: t,
  showTech,
}: {
  project: any;
  index: number;
  theme: ThemeTokens;
  showTech: boolean;
}) {
  const reveal = useScrollReveal<HTMLAnchorElement>("fadeUp", { delay: index * 100 });
  const num = String(index + 1).padStart(2, "0");
  const langColor = LANG_COLORS[p.language || ""] || t.accent;

  return (
    <Link
      ref={reveal.ref}
      href={p.html_url || "#"}
      target="_blank"
      rel="noreferrer"
      className="group relative flex flex-col justify-between p-7 min-h-[220px] transition-all duration-500 hover:-translate-y-1 overflow-hidden"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = t.cardHoverBorder;
        e.currentTarget.style.boxShadow = t.cardHoverShadow;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = t.cardBorder;
        e.currentTarget.style.boxShadow = t.cardShadow;
      }}
      style={{
        ...reveal.style,
        backgroundColor: t.cardBg,
        border: `1px solid ${t.cardBorder}`,
        borderRadius: t.cardRadius,
        boxShadow: t.cardShadow,
      }}
    >
      {/* Number */}
      <span
        className="absolute top-4 right-6 text-[56px] font-black leading-none select-none pointer-events-none"
        style={{ color: t.accent, opacity: 0.04 }}
      >
        {num}
      </span>

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: langColor }} />
            <span className="text-[12px] font-bold" style={{ color: t.textMuted }}>
              {p.language || "Unknown"}
            </span>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ background: t.accentGradient }}
          >
            <ArrowUpRight size={14} color="#fff" />
          </div>
        </div>

        <h3
          className="text-[18px] font-bold tracking-[-0.5px] leading-snug pr-8"
          style={{ color: t.text }}
        >
          {p.name}
        </h3>

        <p
          className="text-[14px] leading-relaxed line-clamp-2"
          style={{ color: t.textMuted }}
        >
          {p.ai_summary || p.description || "No description provided."}
        </p>
      </div>

      {/* Tags */}
      {showTech && p.ai_tags?.length > 0 && (
        <div className="relative flex flex-wrap gap-1.5 mt-5">
          {p.ai_tags.slice(0, 4).map((tag: string) => (
            <span
              key={tag}
              className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider"
              style={{ backgroundColor: t.tagBg, color: t.tagText }}
            >
              {tag}
            </span>
          ))}
          {p.ai_tags.length > 4 && (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
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
