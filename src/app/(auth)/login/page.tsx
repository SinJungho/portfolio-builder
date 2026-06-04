import { signIn } from "@/auth";
import LoginSessionAlert from "@/components/auth/LoginSessionAlert";
import { Button } from "@/components/ui/button";
import { Github, Sparkles } from "lucide-react";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-spotify-near-black px-6">
      <Suspense fallback={null}>
        <LoginSessionAlert />
      </Suspense>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(30,215,96,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative flex flex-col items-center max-w-[400px] w-full text-center">
        {/* Logo */}
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-full bg-spotify-green text-black shadow-spotify transition-transform hover:scale-105 duration-500">
          <Sparkles className="h-8 w-8 stroke-[2.5px]" />
        </div>

        <h1 className="text-[32px] font-black text-white tracking-tight leading-tight mb-4">
          PortfolioForge
        </h1>
        <p className="text-[16px] text-spotify-silver font-medium mb-12">
          GitHub 데이터를 기반으로 <br />
          아름다운 포트폴리오를 1분 만에 완성하세요.
        </p>

        <form
          className="w-full"
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/dashboard" });
          }}
        >
          <Button
            type="submit"
            className="w-full h-14 btn-pill-primary text-[16px]"
          >
            <Github size={22} className="mr-3" />
            GitHub으로 시작하기
          </Button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 w-full">
          <p className="text-[13px] font-bold text-spotify-silver/40 uppercase tracking-spotify">
            No credit card required · Free forever
          </p>
        </div>
      </div>
    </div>
  );
}
