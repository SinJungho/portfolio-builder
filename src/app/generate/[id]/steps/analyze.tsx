"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface SyncStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  synced_count: number;
  error?: string;
}

export default function AnalyzeStep({
  portfolioId,
  syncJobId,
}: {
  portfolioId: string;
  syncJobId?: string;
}) {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timeoutsCount = useRef(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  const { data, error, refetch } = useQuery<SyncStatusResponse>({
    queryKey: ["sync-job", syncJobId],
    queryFn: async () => {
      if (!syncJobId) throw new Error("job_id_missing");
      const res = await fetch(`/api/integrations/github/sync/${syncJobId}`);
      if (!res.ok) throw new Error("sync_failed");
      return res.json();
    },
    refetchInterval: (query) => {
      if (
        query.state.data?.status === "completed" ||
        query.state.data?.status === "failed" ||
        timeoutsCount.current >= 40
      ) {
        return false;
      }
      timeoutsCount.current += 1;
      if (timeoutsCount.current >= 40) {
        setIsTimedOut(true);
        return false;
      }
      return 3000;
    },
    enabled: !!syncJobId,
  });

  useEffect(() => {
    if (data?.status === "completed") {
      router.push(`/generate/${portfolioId}?step=configure`);
    } else if (data?.status === "failed") {
      setTimeout(() => setErrorMsg(data.error || "분석에 실패했습니다."), 0);
    }
  }, [data?.status, portfolioId, router, data?.error]);

  // Step 2: Handle GitHub Session Expired (Auth Error)
  const isAuthError =
    errorMsg?.includes("인증 세션") ||
    error?.message.includes("Bad credentials");

  if (error || errorMsg || isTimedOut) {
    return (
      <div className="flex flex-col items-center gap-8 text-center max-w-sm w-full bg-spotify-dark-surface p-8 md:p-10 rounded-[32px] border border-white/5 shadow-spotify animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-20 h-20 bg-spotify-negative/10 rounded-[28px] flex items-center justify-center">
            {isAuthError ? (
              <LogIn className="w-10 h-10 text-spotify-negative" />
            ) : (
              <AlertCircle className="w-10 h-10 text-spotify-negative" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-spotify-dark-surface rounded-full flex items-center justify-center border border-white/5 shadow-md">
            <div className="w-4 h-4 bg-spotify-negative/20 rounded-full animate-ping opacity-75" />
            <div className="absolute w-2 h-2 bg-spotify-negative rounded-full" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[22px] font-extrabold text-white tracking-tight">
            {isAuthError
              ? "GitHub 연동 정보가 만료되었어요"
              : "오류가 발생했습니다"}
          </h3>
          <p className="text-[15px] font-medium text-spotify-silver leading-relaxed">
            {errorMsg ||
              (isTimedOut
                ? "분석 시간이 너무 오래 걸리고 있습니다. 잠시 후 서버가 안정되면 다시 시도해 주세요."
                : "일시적인 오류입니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요.")}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {isAuthError ? (
            <button
              onClick={() => (window.location.href = "/api/auth/signin/github")}
              className="w-full h-14 bg-spotify-green hover:scale-105 active:scale-95 text-black rounded-full font-bold uppercase tracking-spotify transition-all shadow-[0_8px_20px_rgba(30,215,96,0.2)] cursor-pointer"
            >
              GitHub 다시 연동하기
            </button>
          ) : (
            <button
              onClick={() => {
                timeoutsCount.current = 0;
                setIsTimedOut(false);
                refetch();
              }}
              className="w-full h-14 bg-spotify-green hover:scale-105 active:scale-95 text-black rounded-full font-bold uppercase tracking-spotify transition-all shadow-[0_8px_20px_rgba(30,215,96,0.2)] cursor-pointer"
            >
              다시 시도하기
            </button>
          )}

          <button
            onClick={() => router.push("/")}
            className="w-full h-14 bg-transparent border border-spotify-silver hover:border-white text-white rounded-full font-bold uppercase tracking-spotify transition-all cursor-pointer"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const progress = data?.progress || 0;
  const statusLabel =
    data?.status === "pending"
      ? "분석 준비 중..."
      : `레포지토리 분석 중... (${data?.synced_count || 0}개 완료)`;

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-md bg-spotify-dark-surface p-8 md:p-10 rounded-[32px] border border-white/5 shadow-spotify">
      <Loader2 className="w-12 h-12 animate-spin text-spotify-green mb-2" />
      <div className="text-lg font-bold text-white tracking-tight text-center">
        {statusLabel}
      </div>
      <div className="w-full h-3 bg-spotify-mid-dark rounded-full overflow-hidden p-[2px] border border-white/5">
        <div
          className="h-full bg-gradient-to-r from-spotify-green to-spotify-green-border rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(30,215,96,0.4)]"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-[13px] font-bold font-mono text-spotify-green tracking-wider">
        {progress}%
      </div>
    </div>
  );
}
