import { signIn } from "@/auth";
import LoginSessionAlert from "@/components/auth/LoginSessionAlert";
import { Button } from "@/components/ui/button";
import { Github, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "로그인 | PortfolioForge",
  description:
    "GitHub 계정으로 로그인하면 프로젝트와 활동 기록을 불러와 포트폴리오를 만들 수 있습니다.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string | string[] }>;
}) {
  const { callbackUrl } = await searchParams;
  const redirectTo = typeof callbackUrl === "string" && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")
    ? callbackUrl
    : "/dashboard";

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-spotify-near-black px-6">
      <Suspense fallback={null}>
        <LoginSessionAlert />
      </Suspense>
      <div className="relative flex flex-col items-center max-w-[400px] w-full text-center">
        {/* Logo */}
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-spotify-green text-black shadow-spotify transition-transform hover:scale-105 duration-500">
          <Sparkles className="h-8 w-8 stroke-[2.5px]" />
        </div>

        <h1 className="text-[32px] font-black text-white tracking-tight leading-tight mb-4">
          PortfolioForge
        </h1>
        <p className="text-[16px] text-spotify-silver font-medium mb-12">
          GitHub에 쌓인 작업을 <br />
          채용 담당자가 읽기 좋은 포트폴리오로 만들어요.
        </p>

        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo });
          }}
        >
          <Button
            type="submit"
            className="w-full h-14 btn-pill-primary text-[16px]"
          >
            <Github size={22} className="mr-3" aria-hidden="true" />
            GitHub으로 시작하기
          </Button>
        </form>

        <div className="mt-6 space-y-2 text-left text-[13px] font-medium leading-relaxed text-spotify-silver">
          <p>공개 프로필과 저장소 기본 정보만 읽어요. 코드나 저장소는 수정하지 않아요.</p>
          <p>로그인 후 AI가 대표 프로젝트와 설명 초안을 준비하고, 공개 전 직접 확인해요.</p>
        </div>

      </div>
    </div>
  );
}
