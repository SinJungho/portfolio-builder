"use client";

import type { GenerateJobResponse } from "@/types/generate";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  RotateCcw,
  Settings2,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

export function clampProgress(progress: number | undefined) {
  return Math.min(100, Math.max(0, typeof progress === "number" && Number.isFinite(progress) ? progress : 0));
}

export default function GenerateStep({
  portfolioId,
  generateJobId,
}: {
  portfolioId: string;
  generateJobId?: string;
}) {
  const router = useRouter();
  const timeoutsCount = useRef(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

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
        timeoutsCount.current >= 60 // 3초 간격 폴링, 최대 3분(60회) 대기 후 타임아웃 처리
      ) {
        return false;
      }
      timeoutsCount.current += 1;
      if (timeoutsCount.current >= 60) {
        setIsTimedOut(true);
        return false;
      }
      return 3000;
    },
    enabled: !!generateJobId,
  });

  // API 에러 또는 타임아웃 발생 시 DB에 최종 반영된 published_url 보조 체크
  const { data: dbCheck } = useQuery({
    queryKey: ["portfolio-status", portfolioId],
    queryFn: async () => {
      const res = await fetch(`/api/portfolios/${portfolioId}/status`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!(error || data?.status === "failed" || isTimedOut),
    refetchInterval: (query) => (query.state.data?.is_published ? false : 5000),
  });

  const isActuallyFinished =
    dbCheck?.is_published || data?.status === "completed";

  const renderContent = () => {
    if (
      !generateJobId ||
      (!isActuallyFinished &&
        (error || data?.status === "failed" || isTimedOut))
    ) {
      return (
        <div
          className="
            w-full max-w-[480px] rounded-[32px]
            border border-white/5 bg-spotify-dark-surface
            px-6 sm:px-8 py-10 sm:py-12 text-center
            shadow-spotify
          "
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-spotify-negative/10">
            <AlertCircle className="w-10 h-10 text-spotify-negative" />
          </div>
          <h2 className="text-[24px] font-extrabold tracking-[-1px] text-white mb-2">
            {generateJobId
              ? "포트폴리오 생성에 실패했습니다"
              : "생성 작업을 이어갈 수 없어요"}
          </h2>
          <p className="text-[15px] text-spotify-silver leading-[1.7] mb-8 font-normal">
            {!generateJobId
              ? "생성 작업 정보를 찾을 수 없습니다. 프로젝트를 다시 선택해 생성해 주세요."
              : data?.error ||
              (isTimedOut
                ? "생성 작업이 다소 지연되고 있습니다. 잠시 후 다시 한 번 시도해 주세요."
                : "일시적인 시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.")}
          </p>
          <button
            type="button"
            onClick={() => {
              if (!generateJobId) {
                router.push(`/generate/${portfolioId}?step=configure`);
                return;
              }
              timeoutsCount.current = 0;
              setIsTimedOut(false);
              refetch();
            }}
            className="
              inline-flex items-center gap-2
              rounded-full border border-spotify-silver/30
              bg-transparent px-8 py-4
              text-[15px] font-bold text-white uppercase tracking-spotify
              transition-all duration-200
              hover:border-white hover:scale-105 active:scale-95
              focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green
              motion-reduce:transform-none
              cursor-pointer
            "
          >
            <RotateCcw className="w-4 h-4" />
            {generateJobId ? "다시 시도하기" : "프로젝트 다시 선택하기"}
          </button>
        </div>
      );
    }

    if (isActuallyFinished) {
      const missingFields = data?.missing_optional_fields || [];

      return (
        <div className="flex flex-col items-center gap-8 w-full max-w-[520px] text-white">
          <div
            className="
              w-full rounded-[32px]
              border border-white/5 bg-spotify-dark-surface
              overflow-hidden
              shadow-spotify
              transition-all duration-500
            "
          >
            <div
              className="h-2.5"
              style={{
                background: "linear-gradient(90deg, #1ed760, #1db954)",
              }}
            />

            <div className="flex flex-col items-center gap-8 px-6 sm:px-10 py-10 sm:py-12 text-center">
              <div
                className="flex h-20 sm:h-24 w-20 sm:w-24 items-center justify-center rounded-[24px] sm:rounded-[32px]"
                style={{
                  background: "linear-gradient(135deg, #1ed760, #1db954)",
                  boxShadow: "0 12px 32px rgba(30,215,96,0.3)",
                  transform: "rotate(-4deg)",
                }}
              >
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-black fill-black" />
              </div>

              <div className="space-y-3">
                <h2 className="text-[26px] sm:text-[32px] font-extrabold tracking-[-1px] sm:tracking-[-1.5px] text-white leading-[1.2]">
                  초안이 준비되었습니다! 🎉
                </h2>
                <p className="text-sm sm:text-[16px] text-spotify-silver font-medium">
                  에디터에서 미리보기를 확인한 뒤 공개하세요.
                </p>
              </div>

              <button
                type="button"
                onClick={() => router.push(`/editor/${portfolioId}`)}
                className="flex h-14 sm:h-[60px] w-full items-center justify-center gap-2 rounded-full bg-spotify-green text-sm sm:text-[16px] font-bold text-black shadow-[0_8px_24px_rgba(30,215,96,0.25)] transition-all hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green motion-reduce:transform-none"
              >
                <Settings2 className="w-4 h-4 sm:w-5 sm:h-5" />
                미리보기 및 공개하기
              </button>
            </div>
          </div>

          {missingFields.length > 0 && (
            <div
              className="
                flex w-full items-start gap-4
                rounded-[28px] px-6 py-5
                bg-spotify-dark-surface border border-white/5
                shadow-spotify animate-in fade-in slide-in-from-bottom-4 duration-700
              "
            >
              <div className="p-2.5 rounded-2xl bg-spotify-green/10 text-spotify-green shrink-0">
                <Sparkles className="w-6 h-6 fill-current" />
              </div>
              <div className="text-[14px] text-spotify-silver leading-[1.7] text-left">
                <span className="font-bold block mb-0.5 text-spotify-green">
                  더 신뢰감 높은 포트폴리오를 만들려면?
                </span>
                <p className="font-normal">
                  {missingFields.includes("email") && "이메일"}
                  {missingFields.includes("email") &&
                    missingFields.includes("linkedin_url") &&
                    ", "}
                  {missingFields.includes("linkedin_url") && "LinkedIn"}
                  {(missingFields.includes("email") ||
                    missingFields.includes("linkedin_url")) &&
                    missingFields.includes("website_url") &&
                    ", "}
                  {missingFields.includes("website_url") && "개인 웹사이트"}를
                  추가하면 방문자(인사담당자)에게 한층 더 신뢰를 줄 수 있어요.
                </p>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/generate/${portfolioId}?step=adjust`)
                  }
                  className="mt-2 flex items-center gap-1 font-bold text-spotify-green transition-all hover:gap-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green cursor-pointer"
                >
                  지금 바로 보완하기 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      );
    }

    const progress = clampProgress(data?.progress);
    const statusLabel =
      progress >= 80
        ? "마지막 단장 중이에요. 거의 다 되었어요!"
        : progress >= 40
          ? "프로젝트를 바탕으로 멋진 블록을 다듬고 있어요..."
          : "GitHub 저장소 데이터를 꼼꼼히 분석하고 있어요...";

    return (
      <div
        className="
          w-full max-w-[460px] rounded-[32px]
          border border-white/5 bg-spotify-dark-surface
          px-10 py-12 text-center
          shadow-spotify
        "
      >
        <div className="flex flex-col items-center gap-8" aria-live="polite">
          <div className="flex h-20 w-20 items-center justify-center rounded-[28px] shadow-sm border border-white/5 bg-spotify-mid-dark">
            <Loader2 className="w-10 h-10 animate-spin text-spotify-green" />
          </div>

          <div className="space-y-3">
            <h2 className="text-[22px] font-extrabold tracking-[-0.7px] text-white">
              {statusLabel}
            </h2>
            <p className="text-[15px] text-spotify-silver font-medium whitespace-pre-wrap leading-[1.6]">
              잠시만 기다려 주세요.
              <br />
              AI가 당신만을 위한 맞춤형 포트폴리오를 제작하고 있습니다.
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="w-full h-3 bg-spotify-mid-dark rounded-full overflow-hidden p-[3px] border border-white/5">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                role="progressbar"
                aria-label="포트폴리오 생성 진행률"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                style={{
                  width: `${Math.max(progress, 5)}%`,
                  background: "linear-gradient(90deg, #1ed760, #1db954)",
                  boxShadow: "0 0 12px rgba(30,215,96,0.4)",
                }}
              />
            </div>
            <div className="flex justify-center flex-col items-center gap-1">
              <span className="text-[13px] font-bold font-mono text-spotify-green">
                {progress}%
              </span>
              <span className="text-[11px] font-bold text-spotify-silver uppercase tracking-widest">
                포트폴리오 생성 중
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-spotify-near-black px-6 py-12">
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-[radial-gradient(circle,rgba(30,215,96,0.04)_0%,transparent_70%)]
        "
      />

      <div className="relative z-10 w-full flex justify-center py-20">
        {renderContent()}
      </div>
    </div>
  );
}
