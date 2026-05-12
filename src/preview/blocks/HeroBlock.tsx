"use client";

import React from "react";
import Image from "next/image";
import { GitFork, Star, Code2 } from "lucide-react";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";

interface HeroBlockProps {
  config: {
    headline: string;
    subheadline: string;
    bio: string;
    show_github_stats?: boolean;
    github_login?: string;
    github_repos_count?: number;
    github_stars_count?: number;
    github_contributions?: number;
  };
  theme: ThemeTokens;
}

export default function HeroBlock({ config, theme: t }: HeroBlockProps) {
  const { headline, subheadline, bio, show_github_stats, github_login } = config;

  const avatarUrl = github_login
    ? `https://github.com/${github_login}.png`
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(headline)}&size=200`;

  const { ref: badgeRef, style: badgeStyle } = useScrollReveal("fadeIn");
  const { ref: headingRef, style: headingStyle } = useScrollReveal("fadeUp");
  const { ref: bioRevealRef, style: bioRevealStyle } = useScrollReveal("fadeUp");
  const { ref: statsRevealRef, style: statsRevealStyle } = useScrollReveal("fadeUp");
  const { ref: avatarRevealRef, style: avatarRevealStyle } = useScrollReveal("scaleIn");

  const stats = [
    { icon: Code2, label: "Repositories", value: config.github_repos_count ?? "–" },
    { icon: Star, label: "Total Stars", value: config.github_stars_count ?? "–" },
    { icon: GitFork, label: "Contributions", value: config.github_contributions ?? "–" },
  ];

  return (
    <section className="relative min-h-[85vh] flex items-center -mx-6 md:-mx-8 px-6 md:px-8 overflow-hidden">
      {/* Ambient Glow — 3-layer mesh */}
      <div
        className="absolute top-[-30%] left-[-10%] w-[60%] h-[80%] rounded-full blur-[140px] opacity-50 pointer-events-none"
        style={{ backgroundColor: t.glowColor }}
      />
      <div
        className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full blur-[120px] opacity-30 pointer-events-none"
        style={{ backgroundColor: t.heroGlow }}
      />
      <div
        className="absolute top-[20%] right-[30%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ backgroundColor: t.accent }}
      />

      <div className="relative w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20 py-16">
        {/* ── Text Content ── */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          {/* Status Badge */}
          <div ref={badgeRef} style={badgeStyle}>
            <div
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full text-[13px] font-semibold tracking-wide"
              style={{ backgroundColor: t.accentSoft, color: t.accent }}
            >
              <span
                className="relative w-2 h-2 rounded-full"
                style={{ backgroundColor: t.accent }}
              >
                <span
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{ backgroundColor: t.accent, opacity: 0.4 }}
                />
              </span>
              Available for hire
            </div>
          </div>

          {/* Name & Title */}
          <div ref={headingRef} style={headingStyle} className="space-y-4">
            <h1
              className="text-[clamp(44px,7vw,72px)] font-extrabold leading-[1.02] tracking-[-3px]"
              style={{ color: t.text }}
            >
              {headline}
            </h1>
            <div className="overflow-hidden">
              <h2
                className="text-xl md:text-2xl font-semibold tracking-[-0.5px]"
                style={{
                  background: t.accentGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {subheadline}
              </h2>
            </div>
          </div>

          {/* Bio */}
          <div ref={bioRevealRef} style={bioRevealStyle}>
            <p
              className="text-[17px] md:text-[18px] leading-[1.75] max-w-xl mx-auto lg:mx-0"
              style={{ color: t.textMuted }}
            >
              {bio}
            </p>
          </div>

          {/* GitHub Stats Row */}
          {show_github_stats && github_login && (
            <div ref={statsRevealRef} style={statsRevealStyle}>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex items-center gap-3 px-5 py-3.5 backdrop-blur-md"
                    style={{
                      backgroundColor: t.cardBg,
                      border: `1px solid ${t.cardBorder}`,
                      borderRadius: "16px",
                      boxShadow: t.cardShadow,
                    }}
                  >
                    <stat.icon
                      className="w-4 h-4 shrink-0"
                      style={{ color: stat.label === "Total Stars" ? "#F59E0B" : t.accent }}
                    />
                    <div className="flex flex-col">
                      <span
                        className="text-[11px] font-bold uppercase tracking-[1.5px]"
                        style={{ color: t.textMuted }}
                      >
                        {stat.label}
                      </span>
                      <span
                        className="text-[18px] font-extrabold tracking-tight leading-tight"
                        style={{ color: t.text }}
                      >
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Avatar ── */}
        <div ref={avatarRevealRef} style={avatarRevealStyle} className="shrink-0 relative">
          {/* Glow ring */}
          <div
            className="absolute -inset-4 rounded-full opacity-25 blur-2xl"
            style={{ background: t.accentGradient }}
          />
          {/* Gradient border ring */}
          <div
            className="relative p-1 rounded-full"
            style={{ background: t.accentGradient }}
          >
            <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden group"
              style={{ backgroundColor: t.bg }}
            >
              <Image
                src={avatarUrl}
                alt={headline}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                unoptimized={true}
              />
            </div>
          </div>
          {/* Online indicator */}
          <div
            className="absolute bottom-4 right-4 w-5 h-5 rounded-full border-[3px]"
            style={{
              backgroundColor: "#22C55E",
              borderColor: t.bg,
            }}
          />
        </div>
      </div>


    </section>
  );
}
