import Reveal from "@/components/common/Reveal";
import { Link2, Palette, Rocket, Sparkles } from "lucide-react";
import Image from "next/image";

const steps = [
  {
    icon: Link2,
    title: "GitHub 계정 연결",
    desc: "GitHub로 로그인하면 프로젝트와 활동 기록을 불러올 준비가 됩니다.",
  },
  {
    icon: Sparkles,
    title: "AI 초안 확인",
    desc: "AI가 대표 프로젝트를 추천·정렬하고 설명 초안까지 준비하면, 담을 내용을 최종 확인합니다.",
  },
  {
    icon: Palette,
    title: "필요한 만큼만 다듬기",
    desc: "기본 구성 그대로 시작하고, 바꾸고 싶은 문구·순서·스타일만 화면에서 바로 다듬습니다.",
  },
  {
    icon: Rocket,
    title: "공개하고 공유하기",
    desc: "완성한 포트폴리오를 내 주소로 공개하고, 링크를 바로 공유할 수 있어요.",
  },
] as const;

export default function HowItWorks() {
  return (
    <section className="bg-spotify-near-black px-6 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 max-w-2xl sm:mb-16">
            <h2 className="m-0 text-[clamp(34px,4.5vw,52px)] font-black leading-[1.08] tracking-tight text-white">
              AI 초안에서 내 링크까지,
              <br />
              필요한 흐름만 담았습니다.
            </h2>
            <p className="mt-5 text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              연결하면 AI가 먼저 정리하고, 사용자는 확인한 뒤 공개해요.
            </p>
          </div>
        </Reveal>

        <div className="grid items-start gap-12 lg:grid-cols-[minmax(22rem,0.95fr)_minmax(0,1.05fr)] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28">
            <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-spotify-dark-surface">
              <Image
                src="/images/portfolio-workflow.png"
                alt="저녁 작업 공간에서 포트폴리오를 정리하는 개발자"
                fill
                sizes="(min-width: 1024px) 44vw, calc(100vw - 3rem)"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div className="border-t border-white/10">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.title} delay={i * 60}>
                  <article className="grid gap-5 border-b border-white/10 py-8 sm:grid-cols-[3rem_minmax(0,1fr)] sm:py-9">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white/[0.05] text-spotify-near-white">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <h3 className="text-[24px] font-black leading-tight tracking-tight text-white sm:text-[28px]">
                        {step.title}
                      </h3>
                      <p className="mt-3 max-w-md text-[15px] font-medium leading-relaxed text-spotify-silver sm:text-[16px]">
                        {step.desc}
                      </p>
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
