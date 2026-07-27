"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { BookOpen, ExternalLink, GitFork, Star } from "lucide-react";
import Link from "next/link";

import { type RawProject } from "@/types/project";

export interface ProjectGridProject extends RawProject {
  html_url?: string | null;
  ai_summary?: string | null;
}

interface ProjectGridBlockProps {
  config: {
    layout: "grid" | "list";
    columns: number;
    project_ids: string[];
    show_tech_stack: boolean;
  };
  projects: ProjectGridProject[];
}

export default function ProjectGridBlock({
  config,
  projects,
}: ProjectGridBlockProps) {
  const { columns = 2 } = config;

  return (
    <section className="w-full py-16 px-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-10">
        <div className="h-10 w-1 bg-primary rounded-full" />
        <h2 className="text-3xl font-bold tracking-tight">대표 프로젝트</h2>
      </div>

      <div
        className={`grid gap-6 ${
          columns === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card className="group h-full flex flex-col border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  {project.html_url && (
                    <Link
                      href={project.html_url}
                      target="_blank"
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </Link>
                  )}
                </div>
                <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  {project.language && (
                    <Badge variant="secondary" className="font-mono">
                      {project.language}
                    </Badge>
                  )}
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    {project.stargazers_count}
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="h-3 w-3" />
                    {project.forks_count}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 pt-0 flex-1">
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {project.ai_summary ||
                    project.description ||
                    "이 프로젝트에 대한 설명이 없습니다."}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
