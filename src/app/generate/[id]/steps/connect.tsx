"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ConnectStep({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function run() {
      try {
        const res = await fetch("/api/integrations/github/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force: false }),
        });
        
        if (!res.ok) {
          throw new Error("GitHub 연동 확인 중 오류가 발생했습니다.");
        }

        const data = await res.json();
        if (active) {
          router.push(`/generate/${portfolioId}?step=analyze&sync_job_id=${data.job_id}`);
        }
      } catch (e: any) {
        if (active) setError(e.message);
      }
    }
    
    run();
    return () => { active = false; };
  }, [portfolioId, router]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="text-destructive font-semibold">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 border rounded hover:bg-muted"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      <div className="text-lg font-medium">GitHub 데이터를 가져오는 중...</div>
    </div>
  );
}
