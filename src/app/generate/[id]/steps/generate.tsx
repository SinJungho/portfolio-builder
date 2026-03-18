"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { GenerateJobResponse } from "@/types/generate";

export default function GenerateStep({
  portfolioId,
  generateJobId,
}: {
  portfolioId: string;
  generateJobId?: string;
}) {
  const router = useRouter();
  const timeoutsCount = useRef(0);
  const [copied, setCopied] = useState(false);

  const { data, error, refetch } = useQuery<GenerateJobResponse>({
    queryKey: ["generate-job", generateJobId],
    queryFn: async () => {
      if (!generateJobId) throw new Error("job_id_missing");
      const res = await fetch(`/api/portfolios/generate/${generateJobId}`);
      if (!res.ok) throw new Error("fetch_failed");
      return res.json();
    },
    refetchInterval: (query) => {
      if (
        query.state.data?.status === "completed" ||
        query.state.data?.status === "failed" ||
        timeoutsCount.current >= 20
      ) {
        return false;
      }
      timeoutsCount.current += 1;
      return 3000;
    },
    enabled: !!generateJobId,
  });

  if (error || data?.status === "failed" || timeoutsCount.current >= 20) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-destructive font-semibold">
          {data?.error || (timeoutsCount.current >= 20 ? "시간이 오래 걸리고 있어요" : "생성에 실패했습니다.")}
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

  if (data?.status === "completed") {
    const pubUrl = data.published_url || `${portfolioId}.vercel.app`; // placeholder fallback

        const fullUrl = pubUrl.startsWith("http") ? pubUrl : `https://${pubUrl}`;

    const handleCopy = () => {
      navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="flex flex-col items-center gap-6 max-w-lg w-full text-center p-8 border rounded-xl shadow-sm bg-card text-card-foreground">
        <div className="text-4xl">🎉</div>
        <h2 className="text-2xl font-bold tracking-tight">포트폴리오가 생성되었습니다!</h2>
        
        <div 
          onClick={handleCopy}
          className="group relative px-6 py-3 cursor-pointer bg-muted/50 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
        >
          <span className="font-mono text-lg font-medium select-all">
            {pubUrl}
          </span>
          {copied && (
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-xs py-1 px-2 rounded font-medium shadow-md">
              복사됨!
            </span>
          )}
        </div>

        <div className="flex flex-col w-full gap-3 mt-4">
          <a 
            href={fullUrl} 
            target="_blank" 
            rel="noreferrer"
            className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            배포 URL 열기 ↗
          </a>
          <button 
            onClick={() => router.push(`/generate/${portfolioId}?step=adjust`)}
            className="w-full bg-secondary text-secondary-foreground font-medium py-3 rounded-lg hover:bg-secondary/80 transition-colors"
          >
            미세 조정하기 →
          </button>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          💡 블록 순서·테마·연락처는 미세 조정에서 변경 가능
        </p>
      </div>
    );
  }

  const progress = data?.progress || 0;
  const statusLabel = progress >= 80 ? "거의 다 됐어요..." : "포트폴리오를 구성하는 중...";

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
