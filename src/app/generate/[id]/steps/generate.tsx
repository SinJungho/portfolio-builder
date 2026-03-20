"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, ExternalLink, Settings2, Share2, Check, Sparkles, AlertCircle, RotateCcw, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GenerateJobResponse } from "@/types/generate";

const TOSS_BLUE = "#3182F6";

// Twitter / LinkedIn SVG icons
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
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

  // --- Content Rendering ---
  const renderContent = () => {
    if (error || data?.status === "failed" || timeoutsCount.current >= 20) {
      return (
        <div
          className="
            w-full max-w-[480px] rounded-[32px]
            border border-black/5 bg-white
            px-8 py-12 text-center
            shadow-[0_8px_40px_rgba(0,0,0,0.04)]
          "
        >
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-[#FF616112]">
            <AlertCircle className="w-10 h-10 text-[#FF6161]" />
          </div>
          <h2 className="text-[24px] font-extrabold tracking-[-1px] text-[#191F28] mb-2">
            생성에 실패했습니다
          </h2>
          <p className="text-[15px] text-gray-500 leading-[1.7] mb-8">
            {data?.error || (timeoutsCount.current >= 20 ? "시간이 오래 걸리고 있어요. 다시 시도해주세요." : "예기치 않은 오류가 발생했습니다.")}
          </p>
          <button
            onClick={() => { timeoutsCount.current = 0; refetch(); }}
            className="
              inline-flex items-center gap-2
              rounded-full border border-black/10
              bg-white px-8 py-4
              text-[15px] font-semibold text-[#4B5563]
              transition-all duration-200
              hover:bg-[#F8F9FA] hover:border-black/15
              active:scale-95
            "
          >
            <RotateCcw className="w-4 h-4" />
            다시 시도
          </button>
        </div>
      );
    }

    if (data?.status === "completed") {
      const pubUrl = data.published_url || `/${portfolioId}`;
      const fullUrl = pubUrl.startsWith("http") ? pubUrl : `${typeof window !== "undefined" ? window.location.origin : ""}${pubUrl.startsWith("/") ? pubUrl : `/${pubUrl}`}`;
      const missingFields = data.missing_optional_fields || [];
      const shareText = encodeURIComponent(`GitHub으로 포트폴리오를 5분 만에 만들었어요! 👉 ${fullUrl}`);

      return (
        <div className="flex flex-col items-center gap-8 w-full max-w-[520px]">
          {/* Main Success Card */}
          <div
            className="
              w-full rounded-[32px]
              border border-black/5 bg-white
              overflow-hidden
              shadow-[0_20px_60px_rgba(49,130,246,0.12)]
              transition-all duration-500
            "
          >
            {/* Gradient header strip */}
            <div
              className="h-2"
              style={{ background: `linear-gradient(90deg, ${TOSS_BLUE}, #8B5CF6, #F59E0B)` }}
            />

            <div className="flex flex-col items-center gap-8 px-10 py-12 text-center">
              {/* Success Icon */}
              <div
                className="flex h-24 w-24 items-center justify-center rounded-[32px]"
                style={{
                  background: 'linear-gradient(135deg, #20C997, #10B981)',
                  boxShadow: '0 12px 32px rgba(32,201,151,0.3)',
                  transform: 'rotate(-4deg)'
                }}
              >
                <Sparkles className="w-12 h-12 text-white" />
              </div>

              <div className="space-y-3">
                <h2 className="text-[32px] font-extrabold tracking-[-1.5px] text-[#191F28] leading-[1.2]">
                  포트폴리오가<br />배포되었습니다! 🎉
                </h2>
                <p className="text-[16px] text-gray-500 font-medium">아래 URL에서 지금 바로 확인해보세요.</p>
              </div>

              {/* Published URL Box */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(fullUrl);
                  setCopied(true);
                  toast.success("배포 URL이 복사되었습니다!");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="
                  group relative flex w-full items-center justify-between gap-4
                  rounded-[24px] border border-black/5 bg-[#F8F9FA]
                  px-6 py-5 text-left
                  transition-all duration-300
                  hover:bg-[rgba(49,130,246,0.04)] hover:border-[rgba(49,130,246,0.2)]
                  hover:-translate-y-0.5
                "
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">배포 주소</p>
                  <span className="font-mono text-[15px] font-medium text-[#191F28] select-all truncate block">
                    {fullUrl}
                  </span>
                </div>
                <div className="shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-black/5">
                  {copied ? (
                    <Check className="w-5 h-5 text-[#20C997]" />
                  ) : (
                    <Copy className="w-5 h-5 text-gray-400 group-hover:text-[#3182F6] transition-colors" />
                  )}
                </div>
              </button>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-4 pt-2">
                <a
                  href={fullUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="
                    flex h-[60px] items-center justify-center gap-2
                    rounded-[20px] text-[16px] font-bold text-white
                    transition-all duration-300
                    hover:-translate-y-1 hover:brightness-110 active:scale-95
                  "
                  style={{
                    background: TOSS_BLUE,
                    boxShadow: '0 8px 24px rgba(49,130,246,0.3)',
                  }}
                >
                  <ExternalLink className="w-5 h-5" />
                  보러가기
                </a>
                <button
                  onClick={() => router.push(`/generate/${portfolioId}?step=adjust`)}
                  className="
                    flex h-[60px] items-center justify-center gap-2
                    rounded-[20px] border border-black/10 bg-white
                    text-[16px] font-bold text-[#4B5563]
                    transition-all duration-300
                    hover:bg-[#F8F9FA] hover:border-black/20
                    hover:-translate-y-1 active:scale-95
                  "
                >
                  <Settings2 className="w-5 h-5" />
                  미세 조정
                </button>
              </div>
            </div>
          </div>

          {/* Missing Optional Fields Hint */}
          {missingFields.length > 0 && (
            <div
              className="
                flex w-full items-start gap-4
                rounded-[28px] px-6 py-5
                bg-white/50 backdrop-blur-sm border border-black/5
                shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700
              "
            >
              <div className="p-2.5 rounded-2xl bg-[rgba(49,130,246,0.1)] shrink-0">
                <Sparkles className="w-6 h-6" style={{ color: TOSS_BLUE }} />
              </div>
              <div className="text-[14px] text-gray-600 leading-[1.7]">
                <span className="font-bold block mb-0.5" style={{ color: TOSS_BLUE }}>전문가처럼 보이려면?</span>
                <p>
                  {missingFields.includes("email") && "이메일"}
                  {missingFields.includes("email") && missingFields.includes("linkedin_url") && ", "}
                  {missingFields.includes("linkedin_url") && "LinkedIn"}
                  {(missingFields.includes("email") || missingFields.includes("linkedin_url")) && missingFields.includes("website_url") && ", "}
                  {missingFields.includes("website_url") && "개인 웹사이트"}
                  를 추가해 신뢰도를 높여보세요.
                </p>
                <button
                  onClick={() => router.push(`/generate/${portfolioId}?step=adjust`)}
                  className="mt-2 font-bold flex items-center gap-1 transition-all hover:gap-2"
                  style={{ color: TOSS_BLUE }}
                >
                  지금 추가하러 가기 <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Social Share Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-[14px] font-bold text-gray-400">공유하기</span>
            <div className="flex items-center gap-3">
              <a
                href={`https://twitter.com/intent/tweet?text=${shareText}`}
                target="_blank"
                rel="noreferrer"
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-2xl bg-[#191F28] text-white
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]
                  active:scale-90
                "
              >
                <XIcon className="w-5 h-5" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="
                  flex h-12 w-12 items-center justify-center
                  rounded-2xl bg-[#0A66C2] text-white
                  transition-all duration-300
                  hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(10,102,194,0.25)]
                  active:scale-90
                "
              >
                <LinkedInIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    // --- Loading / In-Progress State ---
    const progress = data?.progress || 0;
    const statusLabel =
      progress >= 80
        ? "마지막 단계를 완료하고 있어요..."
        : progress >= 40
          ? "블록을 예쁘게 구성하고 있어요..."
          : "GitHub 데이터를 분석하고 있어요...";

    return (
      <div
        className="
          w-full max-w-[460px] rounded-[32px]
          border border-black/5 bg-white
          px-10 py-12 text-center
          shadow-[0_8px_40px_rgba(0,0,0,0.04)]
        "
      >
        <div className="flex flex-col items-center gap-8">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-[28px] shadow-sm ring-1 ring-black/5"
            style={{ background: 'white' }}
          >
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: TOSS_BLUE }} />
          </div>

          <div className="space-y-3">
            <h2 className="text-[22px] font-extrabold tracking-[-0.7px] text-[#191F28]">{statusLabel}</h2>
            <p className="text-[15px] text-gray-500 font-medium whitespace-pre-wrap leading-[1.6]">
              잠시만 기다려주세요.<br />AI가 최적의 포트폴리오를 구성하고 있습니다.
            </p>
          </div>

          <div className="w-full space-y-4">
            <div className="w-full h-3 bg-[#F0F4F8] rounded-full overflow-hidden p-[3px]">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(progress, 5)}%`,
                  background: `linear-gradient(90deg, ${TOSS_BLUE}, #8B5CF6)`,
                  boxShadow: '0 0 12px rgba(49,130,246,0.4)'
                }}
              />
            </div>
            <div className="flex justify-center flex-col items-center gap-1">
              <span className="text-[13px] font-bold font-mono" style={{ color: TOSS_BLUE }}>{progress}%</span>
              <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest">Generating Your Site</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] px-6 py-12">
      {/* Subtle grid background */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      {/* Blue glow */}
      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-[radial-gradient(circle,rgba(49,130,246,0.08)_0%,transparent_70%)]
        "
      />

      <div className="relative z-10 w-full flex justify-center py-20">
        {renderContent()}
      </div>
    </div>
  );
}

