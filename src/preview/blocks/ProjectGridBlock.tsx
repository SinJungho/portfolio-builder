"use client";

import React from "react";
import { ArrowUpRight, Code2, Calendar, Star } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";
import { Badge } from "@/components/ui/badge";

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
  portfolioId?: string;
  blockId?: string;
}


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

export default function ProjectGridBlock({ config, theme: t, portfolioId, blockId }: ProjectGridBlockProps) {
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

      {/* Projects List — Unified Design */}
      <div className="space-y-8 md:space-y-12">
        {displayProjects.map((p) => (
          <FeaturedCard 
            key={p.id} 
            project={p} 
            theme={t} 
            showTech={show_tech_stack} 
            customDescription={config.custom_descriptions?.[p.id]}
            portfolioId={portfolioId}
            blockId={blockId}
          />
        ))}
      </div>
    </section>
  );
}

/* ── Unified Project Card (Based on original Featured Design) ── */
function FeaturedCard({
  project: p,
  theme: t,
  showTech,
  customDescription,
  portfolioId,
  blockId,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  project: any;
  theme: ThemeTokens;
  showTech: boolean;
  customDescription?: string;
  portfolioId?: string;
  blockId?: string;
}) {
  const { ref: revealRef, style: revealStyle } = useScrollReveal<HTMLDivElement>("fadeUp");
  const { headline, highlights, demo_url } = parseSummary(p.ai_summary);
  const year = p.pushed_at ? new Date(p.pushed_at).getFullYear() : null;

  const trackClick = async () => {
    if (!portfolioId || !blockId) return;
    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event_type: "block_click", 
          portfolio_id: portfolioId,
          block_id: blockId 
        }),
      });
    } catch (e) {
      console.error("Failed to track project click:", e);
    }
  };

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
      <div className="relative flex flex-col gap-8">
        <div className="space-y-6">
          {/* Metadata Badges - Trendy Style */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge 
              variant="outline" 
              className="px-3 py-1 h-6 rounded-full border-none flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-[1.05] leading-none"
              style={{ 
                color: t.accent,
                backgroundColor: t.accentSoft,
              }}
            >
              <Code2 className="w-3 h-3" />
              <span className="mt-[0.5px]">{p.language || "Unknown"}</span>
            </Badge>

            {year && (
              <Badge 
                variant="outline"
                className="px-3 py-1 h-6 rounded-full border flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider leading-none"
                style={{ 
                  borderColor: t.cardBorder, 
                  color: t.textMuted,
                  backgroundColor: t.cardBg,
                }}
              >
                <Calendar className="w-3 h-3" />
                <span className="mt-[0.5px]">{year}</span>
              </Badge>
            )}

            <Badge 
              variant="outline"
              className="px-3 py-1 h-6 rounded-full border flex items-center justify-center gap-1.5 text-[11px] font-bold uppercase tracking-wider leading-none"
              style={{ 
                borderColor: t.cardBorder, 
                color: t.text,
                backgroundColor: t.cardBg,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
              }}
            >
              <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="mt-[0.5px]">{p.stargazers_count}</span>
            </Badge>
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
              onClick={trackClick}
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
                onClick={trackClick}
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
