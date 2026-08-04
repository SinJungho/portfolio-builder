"use client";

import { AlertCircle, Github, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// 동기화 중 확인하는 GitHub 데이터 항목을 안내한다.
const READING = [
  "커밋과 스타, 사용 언어",
  "대표가 될 만한 프로젝트",
  "최근 활동과 기여 흐름",
];

// 실제 진행률을 알 수 없는 동기화 상태를 표시한다.
const CONNECT_MOTION_CSS =
  "@keyframes pf-sweep{0%{transform:translateX(-100%)}100%{transform:translateX(400%)}}" +
  ".pf-sweep{animation:pf-sweep 1.4s ease-in-out infinite}" +
  "@keyframes pf-read-dot{0%,100%{opacity:.35}50%{opacity:1}}" +
  ".pf-read-dot{animation:pf-read-dot 1.4s ease-in-out infinite}" +
  "@media (prefers-reduced-motion:reduce){.pf-sweep{animation:none;transform:translateX(120%)}" +
  ".pf-read-dot{animation:none;opacity:1}}";

export default function ConnectStep({ portfolioId }: { portfolioId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 컴포넌트가 해제되면 라우팅과 오류 상태 갱신을 중단한다.
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

        // 동기화가 완료되면 분석 단계로 이동한다.
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
      <section
        aria-labelledby="connect-error-title"
        className="flex flex-col items-center gap-8 text-center max-w-md w-full bg-spotify-dark-surface p-8 md:p-10 rounded-[32px] border border-white/5 shadow-spotify animate-in fade-in zoom-in-95 duration-500"
      >
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

        <header className="contents">
          <div className="space-y-3">
            <h3 id="connect-error-title" className="text-[22px] font-extrabold text-white tracking-tight">
            {isAuthError
              ? "GitHub 연동 정보가 만료되었어요"
              : "오류가 발생했습니다"}
            </h3>
            <p className="text-[15px] font-medium text-spotify-silver leading-relaxed">
              {error}
            </p>
          </div>
        </header>

        <div
          role="group"
          aria-label="오류 복구 작업"
          className="flex flex-col gap-3 w-full"
        >
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
      </section>
    );
  }

  return (
    <section
      aria-labelledby="connect-title"
      className="flex flex-col items-center gap-7 w-full max-w-md bg-spotify-dark-surface p-8 md:p-10 rounded-[32px] border border-white/5 shadow-spotify animate-in fade-in zoom-in-95 duration-500"
    >
      <style dangerouslySetInnerHTML={{ __html: CONNECT_MOTION_CSS }} />

      <div className="relative">
        <div className="w-20 h-20 bg-spotify-green/10 rounded-[28px] flex items-center justify-center">
          <Github className="w-10 h-10 text-spotify-green" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-spotify-dark-surface rounded-full flex items-center justify-center border border-white/5 shadow-md">
          <div className="w-4 h-4 bg-spotify-green/20 rounded-full animate-ping opacity-75" />
          <div className="absolute w-2 h-2 bg-spotify-green rounded-full" />
        </div>
      </div>

      <header className="contents">
        <div className="space-y-3 text-center">
          <h3 id="connect-title" className="text-[22px] font-extrabold text-white tracking-tight">
          기여한 저장소를 읽는 중
          </h3>
          <p className="text-[15px] font-medium text-spotify-silver leading-relaxed">
            커밋과 스타, 사용 언어를 살펴보고 있어요.
            <br className="hidden sm:block" />
            코드는 그대로 두고, 보여줄 것만 골라내요.
          </p>
        </div>
      </header>

      <ul className="w-full space-y-3">
        {READING.map((label, i) => (
          <li
            key={label}
            className="flex items-center gap-3 text-[14px] font-semibold text-white"
          >
            <span
              className="pf-read-dot w-2 h-2 rounded-full bg-spotify-green shrink-0"
              style={{ animationDelay: `${i * 0.25}s` }}
              aria-hidden="true"
            />
            {label}
          </li>
        ))}
      </ul>

      <div
        className="w-full h-2 bg-spotify-mid-dark rounded-full overflow-hidden border border-white/5"
        role="progressbar"
        aria-label="GitHub 데이터를 읽는 중"
      >
        <div className="pf-sweep h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-spotify-green to-transparent" />
      </div>

      <p className="text-[13px] font-medium text-spotify-silver">
        보통 몇 분이면 초안이 준비돼요.
      </p>
    </section>
  );
}
