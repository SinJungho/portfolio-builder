"use client";

import React, { useMemo } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface SkillsBlockProps {
  config: {
    chart_type: "radar" | "bar" | "tag_cloud";
    skills: Array<{ name: string; level: number }>;
  };
}

export default function SkillsBlock({ config }: SkillsBlockProps) {
  const { chart_type, skills } = config;

  // Generic fallback if skills array is empty
  const displaySkills = skills.length > 0
    ? skills
    : [
        { name: "TypeScript", level: 90 },
        { name: "React", level: 85 },
        { name: "Next.js", level: 80 },
        { name: "Node.js", level: 75 },
        { name: "PostgreSQL", level: 60 },
      ];

  const chartConfig = {
    level: {
      label: "Skill Level",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <section className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-[32px] font-extrabold tracking-[-1.5px] text-current leading-tight">
          Expertise & Skills
        </h2>
        <div className="h-1.5 w-12 bg-current/20 rounded-full" />
      </div>

      <div className="w-full max-w-4xl mx-auto min-h-[450px] flex items-center justify-center bg-current/2 border border-current/10 rounded-[40px] p-8 md:p-12 shadow-[0_20px_40px_rgba(0,0,0,0.02)]">
        {chart_type === "radar" && (
          <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
            <RadarChart data={displaySkills} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <PolarGrid className="stroke-muted-foreground/30" />
              <PolarAngleAxis 
                dataKey="name" 
                tick={{ fill: "currentColor", fontSize: 13, fontWeight: 500, opacity: 0.8 }} 
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="level"
                fill="var(--color-level)"
                fillOpacity={0.6}
                stroke="var(--color-level)"
                strokeWidth={2}
              />
            </RadarChart>
          </ChartContainer>
        )}

        {chart_type === "bar" && (
          <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
            <BarChart data={displaySkills} layout="vertical" margin={{ top: 20, right: 20, bottom: 20, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-muted-foreground/20" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: "currentColor", fontSize: 14, fontWeight: 500 }}
              />
              <ChartTooltip cursor={{fill: 'var(--color-level)', opacity: 0.1}} content={<ChartTooltipContent />} />
              <Bar dataKey="level" fill="var(--color-level)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
        )}

        {chart_type === "tag_cloud" && (
          <div className="flex flex-wrap items-center justify-center gap-4 py-8">
            {displaySkills.map((s, idx) => {
              // Map 0-100 level to 1rem-3rem font size approximately
              const minFontSize = 0.875;
              const maxFontSize = 3;
              const sizeLine = minFontSize + (s.level / 100) * (maxFontSize - minFontSize);
              
              // Map opacity from 60% to 100%
              const opacity = 0.5 + (s.level / 100) * 0.5;

              return (
                <span
                  key={idx}
                  className="font-bold tracking-tight px-3 py-1 bg-current/4 hover:bg-current/15 rounded-full transition-colors cursor-default"
                  style={{
                    fontSize: `${sizeLine}rem`,
                    opacity: opacity,
                    color: "var(--color-level, currentColor)",
                  }}
                >
                  {s.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
