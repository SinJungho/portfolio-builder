"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, LogIn } from "lucide-react";

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
        
        const data = await res.json();
        
        if (!res.ok) {
          let msg = data.error || "GitHub 연동 확인 중 오류가 발생했습니다.";
          if (msg.includes("Bad credentials")) {
            msg = "GitHub 인증 세션이 만료되었습니다. 다시 로그인해 주세요.";
          }
          throw new Error(msg);
        }

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
    const isAuthError = error.includes("인증 세션") || error.includes("Bad credentials");

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
            {error}
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
               onClick={() => window.location.reload()}
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

  return (
    <div className="flex flex-col items-center gap-6">
      <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
      <div className="text-lg font-medium">GitHub 데이터를 가져오는 중...</div>
    </div>
  );
}
