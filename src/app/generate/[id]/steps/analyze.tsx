"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, LogIn } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

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
  const [timeoutsCount, setTimeoutsCount] = useState(0);

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
        timeoutsCount >= 40
      ) {
        return false;
      }
      setTimeoutsCount(prev => prev + 1);
      return 3000;
    },
    enabled: !!syncJobId,
  });

  const isJobFailed = data?.status === "failed";
  const errorMessage = data?.error || (error instanceof Error ? error.message : null);
  const isTimeout = timeoutsCount >= 40;
  const isAnyError = !!(error || isJobFailed || isTimeout);

  useEffect(() => {
    if (data?.status === "completed") {
      router.push(`/generate/${portfolioId}?step=configure`);
    }
  }, [data?.status, portfolioId, router]);

  // Step 2: Handle GitHub Session Expired (Auth Error)
  const isAuthError = errorMessage?.includes("인증 세션") || errorMessage?.includes("Bad credentials");

  if (isAnyError) {
    return (
      <div className="flex flex-col items-center gap-8 text-center max-w-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="relative">
          <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center">
            {isAuthError ? (
              <LogIn className="w-10 h-10 text-red-500" />
            ) : (
              <AlertCircle className="w-10 h-10 text-red-500" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
             <div className="w-4 h-4 bg-red-200 rounded-full animate-ping opacity-75" />
             <div className="absolute w-2 h-2 bg-red-500 rounded-full" />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-[22px] font-extrabold text-[#191F28] tracking-tight">
            {isAuthError ? "GitHub 연동 정보가 만료되었어요" : "오류가 발생했습니다"}
          </h3>
          <p className="text-[15px] font-medium text-[#4E5968] leading-relaxed">
            {isJobFailed ? (data?.error || "분석에 실패했습니다.") : (isTimeout ? "분석 시간이 너무 오래 걸리고 있습니다. 잠시 후 서버가 안정되면 다시 시도해 주세요." : (errorMessage || "일시적인 오류입니다. 페이지를 새로고침하거나 잠시 후 다시 시도해 주세요."))}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full">
          {isAuthError ? (
             <button 
                onClick={() => window.location.href = '/api/auth/signin/github'} 
                className="w-full h-14 bg-[#3182F6] text-white rounded-2xl font-bold hover:bg-[#1b64da] transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
             >
                GitHub 다시 연동하기
             </button>
          ) : (
             <button
               onClick={() => { setTimeoutsCount(0); refetch(); }}
               className="w-full h-14 bg-[#3182F6] text-white rounded-2xl font-bold hover:bg-[#1b64da] transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
             >
               다시 시도하기
             </button>
          )}
          
          <button 
            onClick={() => router.push('/')}
            className="w-full h-14 bg-gray-50 text-[#4E5968] rounded-2xl font-bold hover:bg-gray-100 transition-all"
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
    <div className="flex flex-col items-center gap-6 w-full max-w-md">
      <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      <div className="text-lg font-medium">{statusLabel}</div>
      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
