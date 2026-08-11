import Reveal from "@/components/common/Reveal";
import MockPortfolio from "@/components/common/MockPortfolio";
import { THEME_LIST, THEMES } from "@/preview/themes";
import { Check } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "템플릿 | PortfolioForge",
  description:
    "다크부터 밝고 차분한 스타일까지, 포트폴리오에 바로 적용할 수 있는 테마를 모았습니다. 색과 여백은 만든 뒤에도 바꿀 수 있어요.",
};

const THEME_FIT: Record<string, string> = {
  spotify: "프로젝트 이미지와 데모가 많은 프론트엔드·크리에이티브 작업",
  minimal: "처음 만드는 포트폴리오와 정보가 많은 백엔드·풀스택 작업",
  midnight: "기술 중심 프로젝트와 깊이 있는 설명이 많은 작업",
  ocean: "주니어 포트폴리오와 가볍고 선명한 인상",
  forest: "협업 경험과 안정적인 인상을 강조할 때",
  sunset: "개인 제품과 사이드 프로젝트를 친근하게 보여줄 때",
};

export default function TemplatesPage() {
  return (
    <div className="bg-spotify-near-black pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-20">
            <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white tracking-tight leading-tight m-0">
              내용에 맞는 첫인상을
              <br />
              고르세요
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              역할과 프로젝트 성격에 가까운 테마를 고르면 돼요. 색과 여백은 만든 뒤에도 바꿀 수 있어요.
            </p>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 gap-12">
          <Reveal delay={100}>
            <div className="bg-spotify-dark-surface rounded-lg p-8 sm:p-16 border border-white/5">
              <div className="flex flex-col lg:flex-row gap-12 items-center">
                <div className="flex-1 text-center lg:text-left">
                  {/* 테마 이름은 THEMES에서 가져온다. 하드코딩하면 에디터에서 고르는 이름과 달라진다. */}
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                    {THEMES.spotify.label}
                  </h2>
                  <p className="text-lg text-spotify-silver font-medium leading-relaxed mb-8">
                    지금 보고 계신 PortfolioForge의 아이덴티티가 담긴 테마예요. <br />
                    {THEMES.spotify.description}
                  </p>
                  <p className="mb-8 text-[14px] font-bold leading-relaxed text-spotify-near-white">
                    잘 맞는 경우 · {THEME_FIT.spotify}
                  </p>
                  <ul className="space-y-3 mb-10 text-spotify-silver font-medium inline-block text-left">
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" />
                      몰입형 다크 테마
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" />
                      반응형 그리드 레이아웃
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-4 w-4 shrink-0 text-spotify-green" aria-hidden="true" />
                      애니메이션 인터랙션
                    </li>
                  </ul>
                  <div>
                    <Link href="/login" className="btn-pill-primary h-12 px-6 text-[14px]">
                      이 테마로 시작하기
                    </Link>
                  </div>
                </div>
                <div className="flex-1 w-full max-w-2xl scale-90 sm:scale-100">
                  <MockPortfolio />
                </div>
              </div>
            </div>
          </Reveal>
          
          {/* 나머지 테마는 실제 토큰으로 그린다 — 자리표시자 대신 진짜 색을 본다. */}
          <div>
            <h2 className="mb-2 text-[22px] font-black tracking-tight text-white sm:text-[26px]">
              다른 인상이 더 맞다면
            </h2>
            <p className="mb-8 text-[15px] font-medium text-spotify-silver">
              콘텐츠의 양과 보여주고 싶은 분위기를 기준으로 고르세요.
            </p>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {THEME_LIST.filter((t) => t.id !== "spotify").map((t) => (
                <li
                  key={t.id}
                  className="overflow-hidden rounded-lg border border-white/10"
                >
                  <div
                    className="flex h-40 flex-col justify-between p-5"
                    style={{ background: t.bg }}
                    aria-hidden="true"
                  >
                    <div
                      className="rounded-md p-3"
                      style={{
                        background: t.cardBg,
                        border: `1px solid ${t.cardBorder}`,
                      }}
                    >
                      <div
                        className="h-2 w-2/3 rounded-full"
                        style={{ background: t.text, opacity: 0.85 }}
                      />
                      <div
                        className="mt-2 h-2 w-1/2 rounded-full"
                        style={{ background: t.textMuted }}
                      />
                    </div>
                    <span
                      className="inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold"
                      style={{ background: t.ctaBg, color: t.ctaText }}
                    >
                      연락하기
                    </span>
                  </div>

                  <div className="bg-spotify-dark-surface p-5">
                    <h3 className="text-[16px] font-bold text-white">{t.label}</h3>
                    <p className="mt-1.5 text-[13px] font-medium leading-snug text-spotify-silver">
                      {t.description}
                    </p>
                    <p className="mt-3 text-[12px] font-bold leading-snug text-spotify-near-white">
                      잘 맞는 경우 · {THEME_FIT[t.id]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
