import { Github, LockKeyhole } from "lucide-react";

export default function visStepVisualConnect() {
  return (
    <div className="w-full p-6 sm:p-8">
      <div className="mx-auto max-w-xs overflow-hidden rounded-2xl border border-[#30363d] bg-[#0d1117] shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
        <div className="border-b border-[#30363d] bg-[#161b22] px-5 py-3">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-[#f0f6fc]">
            <Github size={16} aria-hidden="true" />
            GitHub
          </div>
        </div>

        <div className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#30363d] bg-[#161b22] text-[#8b949e]">
              <LockKeyhole size={16} aria-hidden="true" />
            </div>
            <div>
              <h4 className="text-[14px] font-semibold leading-snug text-[#f0f6fc]">
                GitHub 계정 연결
              </h4>
              <p className="mt-1 text-[12px] leading-relaxed text-[#8b949e]">
                포트폴리오에 사용할 프로젝트와 활동을 불러옵니다.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-[#30363d] bg-[#161b22] px-3 py-2 text-[11px] leading-relaxed text-[#8b949e]">
            공개 정보만 읽을 수 있으며, 저장소를 수정하지 않습니다.
          </div>

          <div className="mt-4 flex gap-2">
            <div className="flex-1 rounded-md border border-[#30363d] bg-[#21262d] px-3 py-2 text-center text-[12px] font-semibold text-[#f0f6fc]">
              취소
            </div>
            <div className="flex-[1.35] rounded-md bg-[#238636] px-3 py-2 text-center text-[12px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              연결 허용
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
