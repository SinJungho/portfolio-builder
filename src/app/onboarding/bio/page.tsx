"use client";

import { Button } from "@/components/ui/button";
import {
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Github,
  Loader2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { errorMessage, responseErrorMessage } from "@/lib/api/errors";

type BioStatus = "loading" | "missing" | "verified" | "error";

const bioExamples = [
  "React와 TypeScript로 사용하기 쉬운 제품을 만드는 프론트엔드 개발자입니다.",
  "Java와 Spring Boot로 안정적인 서비스를 만드는 백엔드 개발자입니다.",
  "Node.js, React, AWS로 제품을 만드는 풀스택 개발자입니다.",
];

export default function OnboardingBioPage() {
  const router = useRouter();
  const [status, setStatus] = useState<BioStatus>("loading");
  const [bio, setBio] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const requestRef = useRef<AbortController | null>(null);

  const checkBio = useCallback(async (manual = false) => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    if (manual) setIsRefreshing(true);

    try {
      const response = await fetch("/api/integrations/github/bio", { signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(responseErrorMessage(data, "GITHUB_BIO_FAILED"));
      if (data.exists) {
        setBio(data.bio);
        setStatus("verified");
      } else {
        setStatus("missing");
        if (manual) toast.message("아직 GitHub 소개를 찾지 못했어요.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStatus("error");
        if (manual) toast.error(errorMessage("GITHUB_BIO_FAILED"));
    } finally {
      if (requestRef.current === controller) requestRef.current = null;
      if (manual) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) void checkBio();
    });
    return () => {
      active = false;
      requestRef.current?.abort();
    };
  }, [checkBio]);

  useEffect(() => {
    if (status !== "verified") return;
    const timeout = window.setTimeout(() => router.push("/dashboard"), 1500);
    return () => window.clearTimeout(timeout);
  }, [router, status]);

  const copyExample = async (example: string, index: number) => {
    try {
      await navigator.clipboard.writeText(example);
      setCopiedIndex(index);
      toast.success("예시를 복사했어요.");
      window.setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error(errorMessage("COPY_FAILED"));
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-spotify-near-black px-4 py-8 sm:px-6">
      <section
        aria-labelledby="onboarding-title"
        className="w-full max-w-lg rounded-2xl bg-spotify-dark-surface p-6 shadow-spotify sm:p-8"
      >
        <header className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green text-black">
            <Github className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mb-2 text-[12px] font-bold tracking-spotify text-spotify-green">
            마지막 확인
          </p>
          <h1 id="onboarding-title" className="text-[28px] font-bold tracking-tight text-white">
            GitHub 소개를 확인할게요
          </h1>
          <p className="mt-3 max-w-md text-[15px] font-medium leading-relaxed text-spotify-silver">
            소개 한 줄이 있으면 AI가 포트폴리오의 첫 소개를 더 정확하게 만들 수 있어요.
          </p>
        </header>

        <div aria-live="polite">
          {status === "loading" && (
            <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-spotify-green" aria-hidden="true" />
              <p className="text-[14px] font-bold text-spotify-silver">GitHub 소개를 확인하는 중이에요.</p>
            </div>
          )}

          {status === "verified" && (
            <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-spotify-green text-black">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-[20px] font-bold text-white">소개를 찾았어요</h2>
                <p className="mt-2 text-[14px] font-medium text-spotify-silver">이 내용을 바탕으로 포트폴리오를 준비할게요.</p>
              </div>
              {bio && <p className="max-w-sm break-words text-[13px] leading-relaxed text-spotify-near-white">“{bio}”</p>}
              <p className="flex items-center gap-2 text-[13px] font-bold text-spotify-green">
                대시보드로 이동 중 <Sparkles className="h-4 w-4" aria-hidden="true" />
              </p>
            </div>
          )}

          {status === "missing" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-spotify-mid-dark p-5">
                <h2 className="text-[18px] font-bold text-white">GitHub 소개가 비어 있어요</h2>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-spotify-silver">
                  아래 예시를 복사해 GitHub 프로필에 붙여 넣은 뒤, 이 화면에서 다시 확인해 주세요.
                </p>
              </div>

              <div>
                <p className="mb-3 text-[12px] font-bold tracking-spotify text-spotify-silver">바로 쓸 수 있는 예시</p>
                <div className="space-y-2">
                  {bioExamples.map((example, index) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => copyExample(example, index)}
                      className="group flex w-full items-start gap-3 rounded-xl bg-spotify-mid-dark px-4 py-3 text-left transition-colors hover:bg-[#282828] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green"
                    >
                      <span className="flex-1 text-[14px] font-medium leading-relaxed text-spotify-near-white">{example}</span>
                      {copiedIndex === index ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-spotify-green" aria-label="복사됨" />
                      ) : (
                        <Copy className="mt-0.5 h-4 w-4 shrink-0 text-spotify-silver group-hover:text-white" aria-hidden="true" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild className="btn-pill-secondary h-12 w-full text-[14px]">
                  <Link href="https://github.com/settings/profile" target="_blank">
                    GitHub에서 소개 수정하기 <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  type="button"
                  className="btn-pill-primary h-12 w-full text-[14px]"
                  onClick={() => checkBio(true)}
                  disabled={isRefreshing}
                  aria-busy={isRefreshing}
                >
                  {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  소개를 추가했어요
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
              <p className="text-[16px] font-bold text-white">GitHub 소개를 확인하지 못했어요</p>
              <p className="text-[14px] font-medium text-spotify-silver">잠시 후 다시 시도해 주세요.</p>
              <Button type="button" className="btn-pill-primary h-11 px-6" onClick={() => checkBio(true)} disabled={isRefreshing} aria-busy={isRefreshing}>
                {isRefreshing ? "확인하는 중…" : "다시 확인하기"}
              </Button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
