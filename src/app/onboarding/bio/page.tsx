"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "next-auth/react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
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

const bioGuideSteps = [
  ["예시를 복사해요", "위 문장 중 하나를 골라 복사해요."],
  ["GitHub Bio에 저장해요", "GitHub 프로필 → Bio에 붙여넣고 저장해요."],
  ["이 탭으로 돌아와요", "돌아오면 소개를 자동으로 다시 확인해요."],
];

export default function OnboardingBioPage() {
  const router = useRouter();
  const [status, setStatus] = useState<BioStatus>("loading");
  const [authError, setAuthError] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [githubOpened, setGithubOpened] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const githubTabWasHiddenRef = useRef(false);

  const checkBio = useCallback(async (manual = false) => {
    if (requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    if (manual) setIsRefreshing(true);
    setAuthError(false);

    try {
      const response = await fetch("/api/integrations/github/bio", { signal: controller.signal });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setAuthError(data?.code === "GITHUB_AUTH_EXPIRED");
        throw new Error(responseErrorMessage(data, "GITHUB_BIO_FAILED"));
      }
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
    if (!githubOpened) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        githubTabWasHiddenRef.current = true;
        return;
      }

      if (githubTabWasHiddenRef.current) {
        githubTabWasHiddenRef.current = false;
        toast.message("돌아오셨네요. GitHub 소개를 다시 확인할게요.");
        void checkBio(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [checkBio, githubOpened]);

  const skipBio = async () => {
    setIsSkipping(true);
    try {
      const response = await fetch("/api/integrations/github/bio", { method: "POST" });
      if (!response.ok) throw new Error(errorMessage("GITHUB_BIO_FAILED"));
      router.push("/dashboard");
    } catch {
      toast.error("지금은 건너뛸 수 없어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsSkipping(false);
    }
  };

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
    <main className="flex min-h-[100dvh] items-center justify-center bg-spotify-near-black px-4 py-8 sm:px-6">
      <section
        aria-labelledby="onboarding-title"
        className="w-full max-w-lg rounded-lg bg-spotify-dark-surface p-6 shadow-spotify sm:p-8"
      >
        <header className="mb-8">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-spotify-green text-black">
            <Github className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mb-2 text-[12px] font-bold tracking-spotify text-spotify-green">
            선택 사항 · 마지막 확인
          </p>
          <h1 id="onboarding-title" className="text-[28px] font-bold tracking-tight text-white">
            GitHub 소개를 확인할까요?
          </h1>
          <p className="mt-3 max-w-md text-[15px] font-medium leading-relaxed text-spotify-silver">
            소개 한 줄이 있으면 AI가 포트폴리오의 첫 소개를 더 정확하게 만들 수 있어요. 없어도 계속 만들 수 있어요.
          </p>
        </header>

        {status !== "verified" && (
          <div className="mb-6 border-b border-white/10 pb-5 text-center">
            <p className="text-[13px] text-spotify-silver">GitHub 소개 없이도 기본 소개로 포트폴리오를 만들 수 있어요.</p>
            <Button type="button" className="btn-pill-secondary mt-2 h-10 px-5 text-[13px]" onClick={skipBio} disabled={isSkipping || isRefreshing || status === "loading"} aria-busy={isSkipping || isRefreshing}>
              {isSkipping ? "계속하는 중…" : "소개 없이 계속하기"}
            </Button>
          </div>
        )}

        <div aria-busy={status === "loading"}>
          {status === "loading" && (
            <div role="status" className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
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
              <Button type="button" className="btn-pill-primary h-11 px-6" onClick={() => router.push("/dashboard")}>
                대시보드로 이동 <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}

          {status === "missing" && (
            <div className="space-y-6">
              <div className="rounded-xl bg-spotify-mid-dark p-5">
                <h2 className="text-[18px] font-bold text-white">GitHub 소개가 비어 있어요</h2>
                <p className="mt-2 text-[14px] font-medium leading-relaxed text-spotify-silver">
                  아래 예시를 GitHub 프로필의 Bio란에 저장한 뒤, 이 탭으로 돌아와 다시 확인해 주세요.
                </p>
              </div>

              <div>
                <p className="mb-3 text-[12px] font-bold tracking-spotify text-spotify-silver">바로 쓸 수 있는 예시</p>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => copyExample(bioExamples[0], 0)}
                    aria-label={copiedIndex === 0 ? `예시 복사됨: ${bioExamples[0]}` : `추천 예시 복사: ${bioExamples[0]}`}
                    className="group flex w-full items-start gap-3 rounded-xl bg-spotify-mid-dark px-4 py-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green"
                  >
                    <span className="flex-1 text-[14px] font-medium leading-relaxed text-spotify-near-white">{bioExamples[0]}</span>
                    {copiedIndex === 0 ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" />
                    ) : (
                      <Copy className="mt-0.5 h-4 w-4 shrink-0 text-spotify-silver group-hover:text-white" aria-hidden="true" />
                    )}
                  </button>
                </div>
                <details className="group mt-3 rounded-lg border border-white/5 bg-spotify-dark-surface p-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-spotify-green">
                    <span>다른 예시 2개 보기</span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-spotify-silver transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <div className="mt-3 space-y-2">
                    {bioExamples.slice(1).map((example, offset) => {
                      const index = offset + 1;
                      return (
                        <button
                          key={example}
                          type="button"
                          onClick={() => copyExample(example, index)}
                          aria-label={copiedIndex === index ? `예시 복사됨: ${example}` : `예시 복사: ${example}`}
                          className="group flex w-full items-start gap-3 rounded-xl bg-spotify-mid-dark px-4 py-3 text-left transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green"
                        >
                          <span className="flex-1 text-[14px] font-medium leading-relaxed text-spotify-near-white">{example}</span>
                          {copiedIndex === index ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" /> : <Copy className="mt-0.5 h-4 w-4 shrink-0 text-spotify-silver group-hover:text-white" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>
                </details>
              </div>

              <div>
                <p className="mb-3 text-[12px] font-bold tracking-spotify text-spotify-silver">3단계로 끝나요</p>
                <ol className="space-y-3" aria-label="GitHub 소개 추가 방법">
                  {bioGuideSteps.map(([title, description], index) => (
                    <li key={title} className="flex items-start gap-3 text-[14px]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-spotify-green text-[12px] font-bold text-black" aria-hidden="true">
                        {index + 1}
                      </span>
                      <p className="pt-0.5 leading-relaxed text-spotify-silver">
                        <span className="font-bold text-white">{title}</span> · {description}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="space-y-3">
                <Button asChild className="btn-pill-secondary h-12 w-full text-[14px]">
                  <Link href="https://github.com/settings/profile" target="_blank" rel="noopener noreferrer" onClick={() => setGithubOpened(true)}>
                    GitHub 프로필에서 Bio 수정하기 <ExternalLink className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">새 탭에서 열림</span>
                  </Link>
                </Button>
                <p className="text-center text-[13px] text-spotify-silver" aria-live="polite">
                  {githubOpened ? "GitHub에서 Bio를 저장한 뒤 이 탭으로 돌아와 주세요." : "GitHub 프로필 → Bio에 한 줄만 추가하면 돼요."}
                </p>
                <Button
                  type="button"
                  className="btn-pill-primary h-12 w-full text-[14px]"
                  onClick={() => checkBio(true)}
                  disabled={isRefreshing}
                  aria-busy={isRefreshing}
                >
                  {isRefreshing ? <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
                  {isRefreshing ? "확인하는 중…" : "GitHub 소개 다시 확인하기"}
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div role="alert" className="flex min-h-48 flex-col items-center justify-center gap-4 text-center">
              <p className="text-[16px] font-bold text-white">
                {authError ? "GitHub 연동이 만료되었어요" : "GitHub가 잠시 응답하지 않아요"}
              </p>
              <p className="text-[14px] font-medium text-spotify-silver">
                {authError ? "GitHub를 다시 연결하면 이어서 확인할 수 있어요." : "인터넷 연결을 확인한 뒤 다시 시도해 주세요. 계속되면 잠시 후 다시 확인할 수 있어요."}
              </p>
              {authError ? (
                <Button type="button" className="btn-pill-primary h-11 px-6" onClick={() => signIn("github", { callbackUrl: "/onboarding/bio" })}>
                  GitHub 다시 연동하기
                </Button>
              ) : (
                <Button type="button" className="btn-pill-primary h-11 px-6" onClick={() => checkBio(true)} disabled={isRefreshing} aria-busy={isRefreshing}>
                  {isRefreshing ? "확인하는 중…" : "다시 확인하기"}
                </Button>
              )}
            </div>
          )}
        </div>

      </section>
    </main>
  );
}
