"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timeoutsCount = useRef(0);

  const { data, error, isError, refetch } = useQuery<SyncStatusResponse>({
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
      return 3000;
    },
    enabled: !!syncJobId,
  });

  useEffect(() => {
    if (data?.status === "completed") {
      // API call to generate
      fetch("/api/portfolios/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio_id: portfolioId, auto_publish: true }),
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.error) {
            setErrorMsg(d.error);
          } else {
            router.push(`/generate/${portfolioId}?step=generate&generate_job_id=${d.job_id}`);
          }
        })
        .catch((e) => setErrorMsg(e.message));
    } else if (data?.status === "failed") {
      setErrorMsg(data.error || "분석에 실패했습니다.");
    }
  }, [data?.status, portfolioId, router, data?.error]);

  if (error || errorMsg || timeoutsCount.current >= 40) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-destructive font-semibold">
          {errorMsg || (timeoutsCount.current >= 40 ? "시간이 오래 걸리고 있어요" : "오류가 발생했습니다")}
        </div>
        <button
          onClick={() => { timeoutsCount.current = 0; refetch(); }}
          className="px-4 py-2 border rounded hover:bg-muted"
        >
          다시 시도
        </button>
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
