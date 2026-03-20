import React from "react";
import { ExternalLink } from "lucide-react";

interface ProjectGridBlockProps {
  config: {
    layout: "grid" | "list" | "masonry";
    columns: number;
    project_ids: string[];
    show_tech_stack: boolean;
    // Server component fetching makes this tricky if preview is purely client component.
    // For now, assume data is passed or fetched.
    // Since page.tsx is SSR, it should preferably fetch all data and pass to PortfolioPreview.
    projectsData?: Array<{
      id: string;
      name: string;
      description: string | null;
      ai_summary: string | null;
      ai_tags: string[];
      html_url: string | null;
      stargazers_count: number;
    }>;
  };
}

export default function ProjectGridBlock({ config }: ProjectGridBlockProps) {
  const { layout, project_ids, show_tech_stack, projectsData = [] } = config;

  // We should render the projectsData. If not provided (during dev preview without data injection), show generic mock
  const displayProjects = projectsData.length > 0 
    ? projectsData 
    : project_ids.map((id, index) => ({
        id,
        name: `Project ${index + 1}`,
        description: "A placeholder project.",
        ai_summary: "AI summary of the project. Built for high performance and scalability.",
        ai_tags: ["React", "TypeScript", "Next.js"],
        html_url: "#",
        stargazers_count: Math.floor(Math.random() * 100),
      }));

  const isList = layout === "list";

  return (
    <section className="space-y-12">
      <div className="space-y-2">
        <h2 className="text-[32px] font-extrabold tracking-[-1.5px] text-current leading-tight">
          Featured Projects
        </h2>
        <div className="h-1.5 w-12 bg-current/20 rounded-full" />
      </div>

      <div 
        className={
          isList 
            ? "flex flex-col gap-8" 
            : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8"
        }
      >
        {displayProjects.map((p) => (
          <a
            key={p.id}
            href={p.html_url || "#"}
            target="_blank"
            rel="noreferrer"
            className="group relative flex flex-col p-8 rounded-[32px] border border-current/10 bg-current/2 hover:bg-current/4 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden"
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-current/3 rounded-full blur-2xl group-hover:bg-current/6 transition-colors" />

            <div className="flex items-start justify-between mb-6 relative z-10">
              <h3 className="text-2xl font-extrabold tracking-[-1px] group-hover:text-blue-500 transition-colors">
                {p.name}
              </h3>
              <div className="flex items-center gap-1.5 text-[13px] font-bold opacity-70 bg-current/5 px-3 py-1.5 rounded-2xl border border-current/10 backdrop-blur-sm">
                <span className="text-amber-400">★</span>
                {p.stargazers_count}
              </div>
            </div>

            <p className="text-[15px] opacity-60 leading-relaxed mb-8 line-clamp-4 font-medium relative z-10">
              {p.ai_summary || p.description || "No description provided."}
            </p>

            <div className="mt-auto flex items-center justify-between relative z-10">
              {show_tech_stack && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {p.ai_tags?.slice(0, 3).map((tag) => (
                    <span 
                      key={tag} 
                      className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-current/8 tracking-wider uppercase opacity-80"
                    >
                      {tag}
                    </span>
                  ))}
                  {p.ai_tags?.length > 3 && (
                    <span className="text-[11px] font-extrabold px-3 py-1.5 rounded-xl bg-current/8 opacity-40">
                      +{p.ai_tags.length - 3}
                    </span>
                  )}
                </div>
              )}
              
              <div className="p-2 rounded-full border border-current/10 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                <ExternalLink size={16} />
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
