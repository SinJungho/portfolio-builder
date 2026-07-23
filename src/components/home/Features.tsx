"use client";

import { ArrowRight, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import Reveal from "../common/Reveal";

export default function Features() {
  const [active, setActive] = useState(0);

  const features = [
    {
      icon: RefreshCw,
      color: "#1ed760",
      title: "자동 GitHub 동기화",
      desc: "새로운 커밋, 스타, 프로젝트가 생길 때마다 포트폴리오도 자동으로 업데이트돼요. 한 번 설정하면 관리할 필요가 없어요.",
      tag: "자동화",
    },
    {
      icon: Sparkles,
      color: "#539df5",
      title: "AI 프로젝트 큐레이션",
      desc: "모든 저장소를 다 보여줄 필요는 없어요. AI가 채용 담당자 눈에 띄는 핵심 프로젝트를 엄선하고, 설명까지 자동으로 작성해줘요.",
      tag: "AI",
    },
    {
      icon: Pencil,
      color: "#ffa42b",
      title: "실시간 WYSIWYG 편집",
      desc: "코드를 몰라도 괜찮아요. 블록을 드래그하고, 색상을 바꾸고, 문구를 수정하면 실시간으로 결과를 확인할 수 있어요.",
      tag: "편집기",
    },
  ];

  return (
    <section className="bg-spotify-near-black py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <Reveal>
          <div className="mb-16">
            <p className="text-[14px] font-bold text-spotify-green uppercase tracking-spotify-wide mb-4">
              FEATURES
            </p>

            <h2 className="text-[clamp(36px,5vw,56px)] font-black leading-tight tracking-tight text-white m-0">
              그냥 만드는 게 아니에요
            </h2>
          </div>
        </Reveal>

        <div className="grid gap-8 border-y border-white/10 py-2 lg:grid-cols-[minmax(16rem,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
          <div role="tablist" aria-label="PortfolioForge 주요 기능" className="divide-y divide-white/10 lg:col-start-1 lg:row-start-1">
            {features.map((f, i) => {
              const Icon = f.icon;
              const selected = active === i;
              return (
                <button key={f.tag} id={`feature-tab-${i}`} role="tab" aria-selected={selected} aria-controls="feature-panel" onClick={() => setActive(i)} className="group flex w-full items-center gap-4 px-2 py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-near-black">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors" style={{ color: selected ? f.color : "#b3b3b3", borderColor: selected ? `${f.color}80` : "rgba(255,255,255,0.12)", background: selected ? `${f.color}18` : "transparent" }}><Icon size={18} aria-hidden="true" /></span>
                  <span className="min-w-0 flex-1"><span className="mb-1 block text-[11px] font-bold tracking-[0.12em]" style={{ color: selected ? f.color : "#b3b3b3" }}>{f.tag}</span><span className="block text-[20px] font-bold tracking-tight text-white sm:text-[22px]">{f.title}</span></span>
                  <ArrowRight size={18} className="shrink-0 transition-transform group-hover:translate-x-1" style={{ color: selected ? f.color : "#737373" }} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          <div id="feature-panel" role="tabpanel" aria-labelledby={`feature-tab-${active}`} className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-spotify-dark-surface p-8 sm:p-10 lg:col-start-2 lg:row-start-1">
            <div className="absolute right-0 top-0 h-44 w-44 rounded-full opacity-20 blur-3xl" style={{ background: features[active].color }} />
            <div className="relative"><span className="mb-8 inline-flex h-14 w-14 items-center justify-center rounded-2xl border" style={{ color: features[active].color, background: `${features[active].color}18`, borderColor: `${features[active].color}45` }}>{(() => { const Icon = features[active].icon; return <Icon size={26} aria-hidden="true" />; })()}</span><h3 className="mb-4 text-[30px] font-black tracking-tight text-white sm:text-[36px]">{features[active].title}</h3><p className="max-w-xl text-[17px] font-medium leading-relaxed text-spotify-silver">{features[active].desc}</p></div>
            <p className="relative mt-8 text-[12px] font-bold tracking-[0.12em] text-spotify-silver/65">필요한 정보를 먼저 정리하고, 결과는 언제든 편집할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
