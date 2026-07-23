import { Check, FolderGit2 } from "lucide-react";

const projects = [
  {
    name: "portfolio-web",
    description: "개인 포트폴리오 · 최근 업데이트",
    tags: ["React", "TypeScript"],
    selected: true,
  },
  {
    name: "team-dashboard",
    description: "팀 대시보드 · 공개 저장소",
    tags: ["Next.js", "Node.js"],
    selected: true,
  },
  {
    name: "api-server",
    description: "서비스 API · 공개 저장소",
    tags: ["Python"],
    selected: false,
  },
];

export default function viStepVisualAnalyze() {
  const selectedCount = projects.filter((project) => project.selected).length;

  return (
    <div className="w-full p-6 sm:p-8">
      <div className="mx-auto max-w-xs rounded-2xl border border-white/10 bg-spotify-near-black p-4 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
        <div className="mb-3 flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-[12px] font-bold text-white">
            <FolderGit2 size={16} className="text-[#539df5]" aria-hidden="true" />
            프로젝트 선택
          </div>
          <span className="rounded-full bg-spotify-green/10 px-2 py-1 text-[10px] font-bold text-spotify-green">
            {selectedCount}개 선택됨
          </span>
        </div>

        <div className="space-y-2">
          {projects.map((project) => (
            <div
              key={project.name}
              className={`flex items-start gap-3 rounded-xl border p-3 ${
                project.selected
                  ? "border-spotify-green/30 bg-spotify-green/5"
                  : "border-white/5 bg-white/[0.03]"
              }`}
            >
              <div
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border ${
                  project.selected
                    ? "border-spotify-green bg-spotify-green text-black"
                    : "border-white/20 bg-transparent"
                }`}
                aria-hidden="true"
              >
                {project.selected && <Check size={11} strokeWidth={3} />}
              </div>

              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold text-white">
                  {project.name}
                </p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-spotify-silver">
                  {project.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-spotify-silver"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 px-1 text-[11px] leading-relaxed text-spotify-silver">
          포트폴리오에 보여줄 프로젝트만 골라보세요.
        </p>
      </div>
    </div>
  );
}
