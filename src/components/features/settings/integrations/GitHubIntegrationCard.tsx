import React from "react";
import { Button } from "@/components/ui/button";
import { Github, RefreshCw } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";

export function GitHubIntegrationCard({ connected }: { connected: boolean }) {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/integrations/github/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseErrorMessage(data, "SYNC_START_FAILED"));
      toast.success("GitHub 동기화를 시작했어요. 잠시 후 대시보드에서 확인해 보세요.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : errorMessage("SYNC_START_FAILED"));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <article className="p-7 bg-spotify-dark-surface rounded-lg flex flex-col sm:flex-row items-start justify-between gap-6 hover:bg-spotify-mid-dark transition-colors group">
      <div className="flex items-start gap-6">
        <div className="w-14 h-14 shrink-0 bg-spotify-green/10 rounded-lg flex items-center justify-center border border-spotify-green/20 group-hover:border-spotify-green/30 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_15px_rgba(30,215,96,0.05)]">
          <Github className="w-7 h-7 text-spotify-green" strokeWidth={1.5} />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3 className="text-[18px] font-bold text-white tracking-tight">
              GitHub
            </h3>
            <span
              role="status"
              aria-label="연동 완료 상태"
              className="flex items-center gap-2 text-[11px] font-bold text-spotify-green bg-spotify-green/10 px-3 py-1 rounded-full tracking-spotify"
            >
              <span className="w-1.5 h-1.5 bg-spotify-green rounded-full shadow-[0_0_8px_rgba(30,215,96,0.6)]"></span>
              {connected ? "연동됨" : "연동 필요"}
            </span>
          </div>
          <p className="text-[14px] text-spotify-silver font-medium leading-relaxed max-w-md">
            저장소와 기여도 데이터를 연동하여 포트폴리오를 자동으로 구축합니다.
          </p>
        </div>
      </div>

      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        {connected && (
          <Button
            variant="outline"
            onClick={handleSync}
            disabled={isSyncing}
            className="w-full sm:w-auto btn-pill-secondary h-11 px-5 text-white border-white/10 bg-transparent hover:bg-white/5"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
            {isSyncing ? "동기화 시작 중" : "지금 동기화"}
          </Button>
        )}
        <Button
          variant={connected ? "ghost" : "default"}
          onClick={() => signIn("github", { callbackUrl: "/settings?section=integrations" })}
          className="w-full sm:w-auto h-11 px-5"
        >
          {connected ? "다시 연동" : "GitHub 연동하기"}
        </Button>
      </div>
    </article>
  );
}
