import React from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function GitHubIntegrationCard() {
  return (
    <article className="p-8 bg-spotify-dark-surface rounded-[32px] border border-white/5 flex flex-col sm:flex-row items-start justify-between gap-6 hover:bg-spotify-mid-dark transition-all group">
      <div className="flex items-start gap-6">
        <div className="w-14 h-14 shrink-0 bg-spotify-green/10 rounded-2xl flex items-center justify-center border border-spotify-green/20 group-hover:border-spotify-green/30 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(30,215,96,0.05)]">
          <Github className="w-7 h-7 text-spotify-green" strokeWidth={1.5} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="text-[18px] font-black text-white tracking-tight">
              GitHub
            </h3>
            <span
              role="status"
              aria-label="연동 완료 상태"
              className="flex items-center gap-2 text-[11px] font-black text-spotify-green bg-spotify-green/10 px-3 py-1 rounded-full uppercase tracking-spotify"
            >
              <span className="w-1.5 h-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]"></span>
              연동됨
            </span>
          </div>
          <p className="text-[14px] text-spotify-silver font-medium leading-relaxed max-w-md">
            레포지토리와 잔디(기여도) 데이터를 연동하여 포트폴리오를 자동으로
            구축합니다.
          </p>
        </div>
      </div>

      <div className="w-full sm:w-auto">
        <Button
          variant="outline"
          disabled
          className="w-full sm:w-40 btn-pill-secondary h-11 text-spotify-silver/40 border-white/5 bg-transparent cursor-not-allowed"
        >
          로그인 필수 연동
        </Button>
      </div>
    </article>
  );
}
