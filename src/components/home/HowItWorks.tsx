import Reveal from "@/components/common/Reveal";
import StepVisualAnalyze from "@/components/home/StepVisualAnalyze";
import StepVisualConnect from "@/components/home/StepVisualConnect";
import StepVisualCustomize from "@/components/home/StepVisualCustomize";
import StepVisualDeploy from "@/components/home/StepVisualDeploy";
import { TOSS_BLUE } from "@/lib/validations/color";

export default function HowItWorks() {
  const steps = [
    {
      emoji: "🔗",
      accentColor: TOSS_BLUE,
      title: "GitHub 계정 연결",
      desc: "복잡한 설정 없이 GitHub 계정으로 로그인하면 끝이에요.",
      visual: <StepVisualConnect />,
    },
    {
      emoji: "✨",
      accentColor: "#8B5CF6",
      title: "AI가 분석하고 큐레이션",
      desc: "커밋 기록, README, 기술 스택을 분석해 최적의 프로젝트를 선별해요.",
      visual: <StepVisualAnalyze />,
    },
    {
      emoji: "🎨",
      accentColor: "#F59E0B",
      title: "원하는 스타일로 편집",
      desc: "마음에 드는 템플릿을 골라 실시간으로 수정하고 꾸며보세요.",
      visual: <StepVisualCustomize />,
    },
    {
      emoji: "🚀",
      accentColor: "#10B981",
      title: "한 번에 배포",
      desc: "내 도메인으로 배포하거나 포지 링크를 바로 공유하세요.",
      visual: <StepVisualDeploy />,
    },
  ];

  return (
    <section className="bg-[#FAFAFA] px-6 py-30">
      <div className="mx-auto max-w-280">
        <Reveal>
          <div className="mb-20 text-center">
            <p
              className="mb-3 text-[14px] font-semibold tracking-[0.5px]"
              style={{ color: TOSS_BLUE }}
            >
              HOW IT WORKS
            </p>

            <h2
              className="
                m-0
                text-[clamp(36px,5vw,56px)]
                font-extrabold
                leading-[1.15]
                tracking-[-1.5px]
                text-[#191F28]
              "
            >
              4단계면 충분해요
            </h2>
          </div>
        </Reveal>

        <div className="flex flex-col gap-6">
          {steps.map((step, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className={`
<<<<<<< HEAD
                  flex flex-col md:flex-row items-center gap-8 md:gap-16
                  rounded-[24px]
                  border border-black/5
                  bg-white
                  px-6 py-8 md:px-14 md:py-12
                  shadow-[0_2px_16px_rgba(0,0,0,0.06)]
                  ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}
=======
                  flex items-center gap-16
                  rounded-[24px]
                  border border-black/5
                  bg-white
                  px-14 py-12
                  shadow-[0_2px_16px_rgba(0,0,0,0.06)]
                  ${i % 2 === 0 ? "flex-row" : "flex-row-reverse"}
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
                `}
              >
                {/* Text */}
                <div className="flex-1">
                  <div
                    className="mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
                    style={{
                      background: `${step.accentColor}14`,
                      border: `1px solid ${step.accentColor}30`,
                    }}
                  >
                    <span className="text-[14px]">{step.emoji}</span>

                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: step.accentColor }}
                    >
                      Step {i + 1}
                    </span>
                  </div>

                  <h3 className="mb-4 text-[32px] font-extrabold tracking-[-0.8px] text-[#191F28]">
                    {step.title}
                  </h3>

                  <p className="text-[17px] leading-[1.7] text-gray-500">
                    {step.desc}
                  </p>
                </div>

                {/* Visual */}
                <div
                  className="
<<<<<<< HEAD
                    flex w-full h-60 shrink-0 md:w-90
=======
                    flex h-60 w-90 shrink-0
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
                    items-center justify-center
                    overflow-hidden rounded-3xl
                    border border-[#F0F4F8]
                    bg-[#F8FAFC]
                  "
                >
                  {step.visual}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
