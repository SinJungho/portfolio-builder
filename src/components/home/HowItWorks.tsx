import Reveal from "@/components/common/Reveal";
import StepVisualAnalyze from "@/components/home/StepVisualAnalyze";
import StepVisualConnect from "@/components/home/StepVisualConnect";
import StepVisualCustomize from "@/components/home/StepVisualCustomize";
import StepVisualDeploy from "@/components/home/StepVisualDeploy";
import { Link2, Sparkles, Palette, Rocket } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: Link2,
      accentColor: "#1ed760",
      title: "GitHub 계정 연결",
      desc: "GitHub로 로그인하면 프로젝트와 활동 기록을 불러올 준비가 됩니다.",
      visual: <StepVisualConnect />,
    },
    {
      icon: Sparkles,
      accentColor: "#539df5",
      title: "보여줄 프로젝트 고르기",
      desc: "프로젝트와 기술 스택을 정리한 뒤, 포트폴리오에 담을 항목을 직접 선택합니다.",
      visual: <StepVisualAnalyze />,
    },
    {
      icon: Palette,
      accentColor: "#ffa42b",
      title: "원하는 스타일로 편집",
      desc: "마음에 드는 템플릿을 골라 실시간으로 수정하고 꾸며보세요.",
      visual: <StepVisualCustomize />,
    },
    {
      icon: Rocket,
      accentColor: "#1ed760",
      title: "공개하고 공유하기",
      desc: "완성한 포트폴리오를 내 주소로 공개하고, 링크를 바로 공유할 수 있어요.",
      visual: <StepVisualDeploy />,
    },
  ];

  return (
    <section className="bg-spotify-near-black px-6 py-24 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 max-w-2xl sm:mb-16">
            <h2 className="m-0 text-[clamp(34px,4.5vw,52px)] font-black leading-[1.08] tracking-tight text-white">
              GitHub에서 포트폴리오까지,
              <br />
              필요한 흐름만 담았습니다.
            </h2>
            <p className="mt-5 text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              연결하고, 보여줄 내용을 고르고, 내 방식으로 다듬어 공개하세요.
            </p>
          </div>
        </Reveal>

        <div className="relative">
          <div aria-hidden="true" className="absolute bottom-12 left-[15px] top-12 hidden w-px bg-white/10 md:block" />
          <div className="flex flex-col">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={i} delay={i * 100}>
                <div
                  className={`
                    relative grid grid-cols-1 items-center gap-8 border-t border-white/10 py-10 first:border-t-0 md:grid-cols-[2.5rem_minmax(0,0.9fr)_minmax(18rem,1.1fr)] md:gap-10 md:py-14 lg:gap-16
                  `}
                >
                  <div className="relative z-10 hidden h-8 w-8 items-center justify-center border border-white/15 bg-spotify-near-black text-[11px] font-bold tabular-nums text-spotify-near-white md:flex">
                    {i + 1}
                  </div>
                  {/* Text */}
                  <div className="w-full text-left">
                    <div className="mb-5 flex items-center gap-2">
                      <Icon size={18} style={{ color: step.accentColor }} aria-hidden="true" />
                      <span className="text-[12px] font-bold tracking-[0.06em] text-spotify-silver">
                        {i + 1}단계
                      </span>
                    </div>

                    <h3 className="mb-4 text-[28px] font-black leading-tight tracking-tight text-white sm:text-[34px]">
                      {step.title}
                    </h3>

                    <p className="max-w-md text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[17px]">
                      {step.desc}
                    </p>
                  </div>

                  {/* Visual */}
                  <div className="flex min-h-[260px] w-full items-center justify-center rounded-3xl border border-white/10 bg-spotify-dark-surface md:min-h-[320px]">
                    {step.visual}
                  </div>
                </div>
              </Reveal>
            );
          })}
          </div>
        </div>
      </div>
    </section>
  );
}
