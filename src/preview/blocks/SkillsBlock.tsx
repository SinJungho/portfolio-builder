"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ThemeTokens } from "../themes";
import { useScrollReveal, useStaggerReveal } from "../hooks/useScrollReveal";

interface SkillsBlockProps {
  config: {
    chart_type: "radar" | "bar" | "tag_cloud";
    skills: Array<{ name: string; level: number }>;
  };
  theme: ThemeTokens;
}

const SKILL_CATEGORIES: Record<string, string[]> = {
  Frontend: ["React", "Vue", "Angular", "Next.js", "Nuxt", "Svelte", "HTML", "CSS", "Tailwind", "SCSS", "TypeScript", "JavaScript", "Redux", "Zustand"],
  Backend: ["Node.js", "Express", "NestJS", "Django", "Flask", "Spring", "Spring Boot", "FastAPI", "Ruby on Rails", "Go", "Rust", "Java", "Python", "PHP", "C#", ".NET"],
  Database: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Prisma", "Drizzle", "DynamoDB", "Supabase", "Firebase"],
  DevOps: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "CI/CD", "GitHub Actions", "Terraform", "Nginx", "Linux", "Vercel"],
  Mobile: ["React Native", "Flutter", "Swift", "Kotlin", "iOS", "Android", "Dart"],
};

const CATEGORY_LABELS: Record<string, string> = {
  Frontend: "프론트엔드",
  Backend: "백엔드",
  Database: "데이터베이스",
  DevOps: "개발 환경",
  Mobile: "모바일",
  Other: "기타",
};

function categorize(skillName: string): string {
  for (const [cat, keywords] of Object.entries(SKILL_CATEGORIES)) {
    if (keywords.some((kw) => skillName.toLowerCase().includes(kw.toLowerCase()))) {
      return cat;
    }
  }
  return "Other";
}

function AnimatedBar({ level, fill, track, delay }: { level: number; fill: string; track: string; delay: number }) {
  const barRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setWidth(level), delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [level, delay]);

  return (
    <div
      ref={barRef}
      className="w-full h-2 rounded-full overflow-hidden"
      style={{ backgroundColor: track }}
    >
      <div
        className="h-full rounded-full"
        style={{
          width: `${width}%`,
          background: fill,
          transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        }}
      />
    </div>
  );
}

export default function SkillsBlock({ config, theme: t }: SkillsBlockProps) {
  const { skills } = config;

  const displaySkills = skills;

  const { ref: headerRef, style: headerStyle } = useScrollReveal("fadeUp");

  // Group by category
  const grouped: Record<string, typeof displaySkills> = {};
  displaySkills.forEach((s) => {
    const cat = categorize(s.name);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const categories = Object.entries(grouped);
  const categoryReveals = useStaggerReveal<HTMLDivElement>(categories.length, "fadeUp");

  if (categories.length === 0) return null;

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div ref={headerRef} style={headerStyle} className="space-y-4">
        <h2
          className="text-[28px] md:text-[36px] font-extrabold tracking-[-2px] leading-none"
          style={{ color: t.text }}
        >
          기술 스택
        </h2>
        <div
          className="h-[3px] w-12 rounded-full"
          style={{ background: t.decorBar }}
        />
      </div>

      {/* Skill Categories */}
      <div className="space-y-10">
        {categories.map(([category, catSkills], catIdx) => {
          const { ref: catRef, style: catStyle } = categoryReveals[catIdx];
          return (
            <div key={category} ref={catRef} style={catStyle} className="space-y-5">
              <h3
                className="text-[15px] font-bold uppercase tracking-[2px]"
                style={{ color: t.accent }}
              >
                {CATEGORY_LABELS[category] || category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {catSkills
                  .sort((a, b) => b.level - a.level)
                  .map((skill, idx) => (
                    <div
                      key={skill.name}
                      className="flex flex-col gap-2.5 p-5 backdrop-blur-sm"
                      style={{
                        backgroundColor: t.surfaceBg,
                        borderRadius: "16px",
                        border: `1px solid ${t.cardBorder}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[15px] font-bold tracking-[-0.3px]"
                          style={{ color: t.text }}
                        >
                          {skill.name}
                        </span>
                        <span
                          className="text-[13px] font-bold tabular-nums"
                          style={{ color: t.accent }}
                        >
                          {skill.level}%
                        </span>
                      </div>
                      <AnimatedBar
                        level={skill.level}
                        fill={t.accentGradient}
                        track={t.progressTrack}
                        delay={idx * 80}
                      />
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
