"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, CircleCheck, Github, Info, Shield } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  async function handleGitHub() {
    if (loading) return;
    setLoading(true);
    await signIn("github", { callbackUrl: "/onboarding" });
  }

  return (
    <main className="min-h-[calc(100vh-64px)] bg-ink-50 flex items-center justify-center px-4 py-12">
      {/*
       * 전체 래퍼: 최대 너비 400px, 페이드업 진입
       * animate-fade-up 은 tailwindcss-animate 플러그인의
       * animate-in + fade-in + slide-in-from-bottom-4 조합으로 대체
       */}
      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* ── 상단 헤딩 영역 ── */}
        <div className="flex flex-col items-center text-center mb-8">
          {/* 로고 아이콘 */}
          <div className="w-12 h-12 rounded-2xl bg-toss-blue flex items-center justify-center mb-5 shadow-blue">
            <svg width="20" height="20" viewBox="0 0 14 14" fill="none">
              <path
                d="M2.5 7L6 10.5L11.5 3.5"
                stroke="white"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h1 className="text-[28px] font-black tracking-tightest text-ink-900 mb-2">
            시작해볼까요?
          </h1>
          <p className="text-[15px] text-ink-500 leading-relaxed">
            GitHub 계정으로 로그인하면
            <br />
            바로 포트폴리오를 만들 수 있어요.
          </p>
        </div>

        {/* ── 카드 ── */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-card">
          {/* GitHub 로그인 버튼 */}
          <Button
            className="w-full px-5 py-3.5"
            onClick={handleGitHub}
            disabled={loading}
          >
            <Github size={18} />
            GitHub로 시작하기
            <ArrowRight size={16} />
          </Button>

          {/* 권한 안내 */}
          <div className="flex items-center justify-center gap-1.5 mt-3.5">
            <Shield size={12} className="text-ink-300 shrink-0" />
            <span className="text-[12px] text-ink-300">
              읽기 전용 권한만 요청합니다
            </span>
          </div>

          {/* 구분선 */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-ink-100" />
            <span className="text-[12px] text-ink-300 font-medium">또는</span>
            <div className="flex-1 h-px bg-ink-100" />
          </div>

          {/* 게스트 데모 버튼 */}
          <Button
            className="
              w-full flex items-center justify-center gap-2
              px-5 py-3.5
              border-[1.5px] border-slate-200
              bg-transparent hover:bg-slate-50 hover:border-slate-300
              text-[14px] font-semibold text-ink-500 hover:text-ink-900
              transition-all duration-200
            "
          >
            <CircleCheck size={15} />
            게스트로 데모 보기
          </Button>

          {/* 안내 박스 */}
          <div className="flex items-start gap-2.5 mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <Info size={14} className="text-ink-300 shrink-0 mt-0.5" />
            <p className="text-[12px] text-ink-300 leading-relaxed">
              처음 로그인하면 포트폴리오 설정 마법사로 연결돼요. 코드 수정
              권한은 요청하지 않아요.
            </p>
          </div>
        </div>

        {/* ── 법적 고지 ── */}
        <p className="text-center text-[12px] text-ink-300 mt-6 leading-relaxed">
          계속 진행하면{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-ink-500 transition-colors"
          >
            이용약관
          </a>{" "}
          및{" "}
          <a
            href="#"
            className="underline underline-offset-2 hover:text-ink-500 transition-colors"
          >
            개인정보처리방침
          </a>
          에 동의하는 것으로 간주합니다.
        </p>
      </div>
    </main>
  );
}
