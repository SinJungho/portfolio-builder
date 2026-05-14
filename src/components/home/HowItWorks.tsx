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
      desc: "복잡한 설정 없이 GitHub 계정으로 로그인하면 끝이에요.",
      visual: <StepVisualConnect />,
    },
    {
      icon: Sparkles,
      accentColor: "#539df5",
      title: "AI가 분석하고 큐레이션",
      desc: "커밋 기록, README, 기술 스택을 분석해 최적의 프로젝트를 선별해요.",
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
      title: "한 번에 배포",
      desc: "내 도메인으로 배포하거나 포지 링크를 바로 공유하세요.",
      visual: <StepVisualDeploy />,
    },
  ];

  return (
    <section className="bg-spotify-near-black px-6 py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-20 text-center">
            <p className="mb-4 text-[14px] font-bold text-spotify-green uppercase tracking-spotify-wide">
              HOW IT WORKS
            </p>

            <h2 className="m-0 text-[clamp(36px,5vw,56px)] font-black leading-tight tracking-tight text-white">
              4단계면 충분해요
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <Reveal key={i} delay={i * 100}>
                <div
                  className={`
                    flex flex-col md:flex-row items-center gap-12 lg:gap-24
                    rounded-[40px]
                    border border-white/5
                    bg-spotify-dark-surface
                    px-8 py-10 md:px-16 md:py-16
                    shadow-spotify
                    ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}
                  `}
                >
                  {/* Text */}
                  <div className="flex-1 w-full text-center md:text-left">
                    <div
                      className="mb-8 inline-flex items-center gap-3 rounded-full px-5 py-2"
                      style={{
                        background: `${step.accentColor}15`,
                        border: `1px solid ${step.accentColor}30`,
                      }}
                    >
                      <Icon size={16} style={{ color: step.accentColor }} />

                      <span
                        className="text-[13px] font-bold uppercase tracking-spotify"
                        style={{ color: step.accentColor }}
                      >
                        Step {i + 1}
                      </span>
                    </div>

                    <h3 className="mb-6 text-[32px] sm:text-[40px] font-black tracking-tight text-white leading-tight">
                      {step.title}
                    </h3>

                    <p className="text-[18px] leading-relaxed text-spotify-silver font-medium">
                      {step.desc}
                    </p>
                  </div>

                  {/* Visual */}
                  <div
                    className="
                      flex w-full h-[280px] shrink-0 md:w-[420px] md:h-[340px]
                      items-center justify-center
                      overflow-hidden rounded-3xl
                      border border-white/5
                      bg-spotify-near-black
                    "
                  >
                    {step.visual}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
