"use client";

import React from "react";
import type { ThemeTokens } from "../themes";

interface SkillsBlockProps {
  config: {
    chart_type?: "radar" | "bar" | "tag_cloud";
    skills: Array<{ name: string; level: number }>;
  };
  theme: ThemeTokens;
}

// 숙련도를 0~100 범위로 제한한다.
const clampLevel = (n: number) => Math.min(100, Math.max(0, n));

const proficiencyLabel = (level: number) =>
  level >= 80 ? "능숙" : level >= 50 ? "사용 가능" : "기초";

// 숙련도 단계를 막대 폭으로 변환한다.
const tierWidth = (level: number) =>
  level >= 80 ? "100%" : level >= 50 ? "66%" : "33%";

export default function SkillsBlock({ config, theme: t }: SkillsBlockProps) {
  const { skills } = config;

  if (skills.length === 0) return null;

  // 숙련도 내림차순으로 정렬한다.
  const ranked = [...skills].sort((a, b) => b.level - a.level);

  return (
    <section className="space-y-12">
      <div className="space-y-4">
        <h2
          className="text-[28px] md:text-[36px] font-extrabold tracking-[-1px] leading-none"
          style={{ color: t.text }}
        >
          기술 스택
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
        {ranked.map((skill) => {
          const lvl = clampLevel(skill.level);
          const label = proficiencyLabel(lvl);
          return (
            <div key={skill.name} className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="text-[15px] font-bold"
                  style={{ color: t.text }}
                >
                  {skill.name}
                </span>
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: t.textMuted }}
                >
                  {label}
                </span>
              </div>
              <div
                className="h-2 w-full rounded-full overflow-hidden"
                aria-hidden="true"
                style={{ backgroundColor: t.tagBg }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: tierWidth(lvl),
                    backgroundColor: t.text,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
