import { TOSS_BLUE } from "@/lib/validations/color";
import Reveal from "../common/Reveal";

export default function Pricing() {
  const plans = [
    {
      name: "무료",
      price: "₩0",
      period: "/월",
      desc: "처음 시작하기 딱 좋아요",
      color: "#6B7280",
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
      color: TOSS_BLUE,
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
      color: "#8B5CF6",
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
    <section className="bg-white py-30 px-6">
      <div className="max-w-280 mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold mb-3 tracking-[0.5px]"
              style={{ color: TOSS_BLUE }}
            >
              PRICING
            </p>

            <h2 className="text-[clamp(36px,5vw,56px)] font-extrabold text-[#191F28] tracking-[-1.5px] leading-[1.15] m-0">
              합리적인 가격으로
              <br />
              커리어를 빌드하세요
            </h2>
          </div>
        </Reveal>

<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
=======
        <div className="grid grid-cols-3 gap-5 items-start">
>>>>>>> a275093 (Feat : 메인 페이지 컴포넌트 수정)
          {plans.map((p, i) => (
            <Reveal key={i} delay={i * 100}>
              <div
                className={`
                  relative rounded-3xl p-9 transition-all
                  ${
                    p.primary
                      ? "bg-[#191F28] shadow-[0_24px_64px_rgba(0,0,0,0.2)] scale-[1.04]"
                      : "bg-white border-2 border-[#F0F4F8] shadow-[0_2px_16px_rgba(0,0,0,0.04)]"
                  }
                `}
              >
                {/* badge */}
                {p.badge && (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-white text-xs font-bold px-4 py-1.25 rounded-full"
                    style={{ background: TOSS_BLUE }}
                  >
                    {p.badge}
                  </div>
                )}

                {/* plan name */}
                <div className="mb-2 text-[15px] font-bold text-gray-400">
                  {p.name}
                </div>

                {/* price */}
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className={`text-[40px] font-extrabold tracking-[-1px] ${
                      p.primary ? "text-white" : "text-[#191F28]"
                    }`}
                  >
                    {p.price}
                  </span>

                  <span
                    className={`text-[15px] ${
                      p.primary ? "text-gray-500" : "text-gray-400"
                    }`}
                  >
                    {p.period}
                  </span>
                </div>

                {/* desc */}
                <div className="text-sm text-gray-400 mb-8">{p.desc}</div>

                {/* CTA */}
                <button
                  className={`
                    w-full py-3.25 rounded-xl text-[15px] font-bold
                    transition-all mb-7
                    ${p.primary ? "text-white" : "bg-slate-50 text-gray-700"}
                  `}
                  style={{
                    background: p.primary ? TOSS_BLUE : undefined,
                  }}
                >
                  {p.cta}
                </button>

                {/* features */}
                <div className="flex flex-col gap-3">
                  {p.features.map((f) => (
                    <div
                      key={f}
                      className={`flex items-center gap-2.5 text-sm ${
                        p.primary ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      <span
                        className="font-bold text-[16px]"
                        style={{
                          color: p.primary ? "#3182F6" : "#10B981",
                        }}
                      >
                        ✓
                      </span>
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
