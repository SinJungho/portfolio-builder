import { Check } from "lucide-react";
import Reveal from "../common/Reveal";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  const plans = [
    {
      name: "Free",
      price: "₩0",
      period: "/월",
      desc: "처음 시작하기 딱 좋아요",
      features: [
        "포트폴리오 1개",
        "기본 템플릿 3종",
        "GitHub 기본 연동",
        "포지 도메인 제공",
      ],
      cta: "무료로 시작",
      primary: false,
    },
    {
      name: "Pro",
      price: "₩9,900",
      period: "/월",
      desc: "취업 준비 중이라면",
      badge: "가장 인기",
      features: [
        "포트폴리오 무제한",
        "프리미엄 템플릿 전체",
        "커스텀 도메인 연결",
        "AI 큐레이션 무제한",
        "방문자 분석 대시보드",
        "우선 고객 지원",
      ],
      cta: "Pro 시작하기",
      primary: true,
    },
    {
      name: "Team",
      price: "₩29,900",
      period: "/월",
      desc: "팀 또는 부트캠프용",
      features: [
        "Pro 기능 전체 포함",
        "팀원 10명까지",
        "프라이빗 템플릿",
        "팀 분석 리포트",
        "전담 온보딩 지원",
      ],
      cta: "팀 플랜 시작",
      primary: false,
    },
  ];

  return (
    <section className="bg-spotify-near-black py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <p className="text-[14px] font-bold text-spotify-green uppercase tracking-spotify-wide mb-4">
              PRICING
            </p>

            <h2 className="text-[clamp(36px,5vw,56px)] font-black text-white tracking-tight leading-tight m-0">
              합리적인 가격으로
              <br />
              커리어를 빌드하세요
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className={`
                  relative rounded-[40px] p-10 transition-all duration-500 border border-white/5
                  ${
                    p.primary
                      ? "bg-spotify-dark-surface shadow-spotify scale-[1.05] z-10 border-spotify-green/20"
                      : "bg-spotify-near-black hover:bg-spotify-dark-surface shadow-spotify-md"
                  }
                `}
              >
                {/* badge */}
                {p.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-spotify-green text-black text-[12px] font-black px-6 py-1.5 rounded-full uppercase tracking-spotify shadow-[0_0_20px_rgba(30,215,96,0.4)]">
                    {p.badge}
                  </div>
                )}

                {/* plan name */}
                <div className="mb-4 text-[14px] font-bold text-spotify-silver uppercase tracking-spotify-wide">
                  {p.name}
                </div>

                {/* price */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-[44px] font-black text-white tracking-tight">
                    {p.price}
                  </span>

                  <span className="text-[16px] font-bold text-spotify-silver">
                    {p.period}
                  </span>
                </div>

                {/* desc */}
                <div className="text-[15px] text-spotify-silver mb-10 font-medium">{p.desc}</div>

                {/* CTA */}
                <Button
                  className={`
                    w-full h-12 mb-10 text-[15px]
                    ${p.primary ? "btn-pill-primary" : "btn-pill-secondary"}
                  `}
                >
                  {p.cta}
                </Button>

                {/* features */}
                <div className="flex flex-col gap-4">
                  {p.features.map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-3 text-[14px] text-spotify-silver font-medium"
                    >
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-spotify-green/10 text-spotify-green">
                        <Check size={12} strokeWidth={4} />
                      </div>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
