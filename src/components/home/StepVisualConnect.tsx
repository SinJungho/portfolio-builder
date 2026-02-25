import { Github } from "lucide-react";

export default function StepVisualConnect() {
  return (
    <div className="w-full p-6">
      <div className="mx-auto max-w-xs rounded-xl bg-white p-5 shadow-lg">
        <div className="mb-4 flex items-center gap-3">
          {/* Icon */}
          <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#191F28]">
            <Github size={18} color="white" />
          </div>

          {/* Text */}
          <div>
            <div className="text-[14px] font-semibold text-[#191F28]">
              GitHub
            </div>
            <div className="text-[12px] text-gray-400">OAuth 2.0</div>
          </div>
        </div>

        {/* Button mock */}
        <div className="rounded-lg bg-[#191F28] px-4 py-2.5 text-center text-[13px] font-semibold text-white">
          Authorize PortfolioForge
        </div>

        {/* Caption */}
        <div className="mt-3 text-center text-[11px] text-gray-400">
          읽기 전용 권한만 요청해요
        </div>
      </div>
    </div>
  );
}
