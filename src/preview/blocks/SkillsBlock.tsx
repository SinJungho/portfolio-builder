"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";

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

function CategoryBlock({
  category,
  catSkills,
  catIdx,
  t,
}: {
  category: string;
  catSkills: Array<{ name: string; level: number }>;
  catIdx: number;
  t: ThemeTokens;
}) {
  const catReveal = useScrollReveal("fadeUp", { delay: catIdx * 100 });
  return (
    <div ref={catReveal.ref} style={catReveal.style} className="space-y-5">
      <h3
        className="text-[15px] font-bold uppercase tracking-[2px]"
        style={{ color: t.accent }}
      >
        {category}
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
}

export default function SkillsBlock({ config, theme: t }: SkillsBlockProps) {
  const { skills } = config;

  const displaySkills =
    skills.length > 0
      ? skills
      : [
          { name: "TypeScript", level: 90 },
          { name: "React", level: 85 },
          { name: "Next.js", level: 80 },
          { name: "Node.js", level: 75 },
          { name: "PostgreSQL", level: 60 },
        ];

  const header = useScrollReveal("fadeUp");

  // Group by category
  const grouped: Record<string, typeof displaySkills> = {};
  displaySkills.forEach((s) => {
    const cat = categorize(s.name);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const categories = Object.entries(grouped);

  return (
    <section className="space-y-12">
      {/* Section Header */}
      <div ref={header.ref} style={header.style} className="space-y-4">
        <h2
          className="text-[28px] md:text-[36px] font-extrabold tracking-[-2px] leading-none"
          style={{ color: t.text }}
        >
          Skills & Expertise
        </h2>
        <div
          className="h-[3px] w-12 rounded-full"
          style={{ background: t.decorBar }}
        />
      </div>

      {/* Skill Categories */}
      <div className="space-y-10">
        {categories.map(([category, catSkills], catIdx) => (
          <CategoryBlock
            key={category}
            category={category}
            catSkills={catSkills}
            catIdx={catIdx}
            t={t}
          />
        ))}
      </div>
    </section>
  );
}
