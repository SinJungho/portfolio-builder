"use client";

import { AlertCircle, Loader2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConnectStep({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트 언마운트 시점에 비동기 처리가 완료되어 발생할 수 있는 메모리 누수 및 예기치 않은 라우팅(경쟁 상태)을 방지하기 위해 active 플래그를 활용한 취소 패턴을 적용합니다.
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
          router.push(
            `/generate/${portfolioId}?step=analyze&sync_job_id=${data.job_id}`,
          );
        }
      } catch (e: unknown) {
        if (active) setError((e as Error).message);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [portfolioId, router]);

  if (error) {
    const isAuthError =
      error.includes("인증 세션") || error.includes("Bad credentials");

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
            {error}
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
              onClick={() => window.location.reload()}
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

  return (
    <div className="flex flex-col items-center gap-6 py-20">
      <Loader2 className="w-12 h-12 animate-spin text-spotify-green" />
      <div className="text-lg font-bold text-white tracking-tight">
        GitHub 데이터를 가져오는 중...
      </div>
    </div>
  );
}
