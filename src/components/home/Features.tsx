"use client";

import { ArrowUpRight, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import Reveal from "../common/Reveal";

const features = [
  {
    icon: RefreshCw,
    tag: "연결만 하면 끝",
    title: "커밋하면 자동으로 업데이트",
    summary: "한 번 연결하면 손댈 일이 없어요",
    desc: "커밋, 스타, 새 프로젝트가 생기면 포트폴리오도 자동으로 따라 바뀌어요. 처음 한 번만 연결해두면 돼요.",
  },
  {
    icon: Sparkles,
    tag: "AI가 먼저 골라요",
    title: "보여줄 작업과 설명을 초안으로",
    summary: "빈 화면에서 시작하지 않도록",
    desc: "AI가 저장소를 전부 나열하는 대신 대표 프로젝트를 추천하고 순서를 잡아, 설명까지 읽기 좋은 초안으로 준비해요. 마지막 선택만 직접 하면 돼요.",
  },
  {
    icon: Pencil,
    tag: "드래그로 뚝딱",
    title: "화면 보면서 바로 편집",
    summary: "코드는 몰라도 괜찮아요",
    desc: "블록을 옮기고, 색을 바꾸고, 문구를 다듬으면 결과가 그 자리에서 바로 바뀌어요. 보이는 그대로 고치면 돼요.",
  },
];

export default function Features() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const go = (i: number) => {
    const next = (i + features.length) % features.length;
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        go(active + 1);
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        go(active - 1);
        break;
      case "Home":
        e.preventDefault();
        go(0);
        break;
      case "End":
        e.preventDefault();
        go(features.length - 1);
        break;
    }
  };

  const current = features[active];
  const CurrentIcon = current.icon;

  return (
    <section className="bg-spotify-near-black px-6 py-20 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 max-w-2xl sm:mb-16">
            <h2 className="m-0 text-[clamp(36px,5vw,56px)] font-black leading-tight tracking-tight text-white">
              처음부터, 공개한 뒤까지 덜 손가게
            </h2>
            <p className="mt-5 text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              AI 초안으로 시작하고 필요한 만큼만 고친 뒤, GitHub의 새 활동도 계속 반영해요.
            </p>
          </div>
        </Reveal>

        <div className="grid gap-8 lg:grid-cols-[minmax(17rem,0.74fr)_minmax(0,1.26fr)] lg:gap-16">
          {/* Index / selector */}
          <div
            role="tablist"
            aria-label="PortfolioForge 주요 기능"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="divide-y divide-white/10 border-y border-white/10 lg:col-start-1 lg:row-start-1"
          >
            {features.map((f, i) => {
              const Icon = f.icon;
              const selected = active === i;
              return (
                <button
                  key={f.tag}
                  ref={(el) => {
                    tabRefs.current[i] = el;
                  }}
                  id={`feature-tab-${i}`}
                  role="tab"
                  aria-selected={selected}
                  aria-controls="feature-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="group relative flex w-full items-center gap-4 py-5 pl-6 pr-2 text-left transition-colors duration-300 hover:bg-white/3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-spotify-green"
                >
                  {/* Traveling accent rail: the signature marker */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-1/2 h-9 w-0.75 -translate-y-1/2 rounded-full bg-spotify-green transition-all duration-300 ease-out motion-reduce:transition-none ${selected ? "scale-y-100 opacity-100" : "scale-y-25 opacity-0"}`}
                  />
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300 ${selected ? "border-spotify-green/50 bg-spotify-green/10 text-spotify-green" : "border-white/10 text-spotify-silver"}`}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`mb-2 inline-flex rounded-md px-2 py-1 text-[12px] font-semibold tracking-[-0.01em] transition-colors duration-300 ${selected ? "bg-spotify-green/15 text-white" : "bg-white/5 text-spotify-silver"}`}
                    >
                      {f.tag}
                    </span>
                    <span
                      className={`block text-[19px] font-bold leading-snug tracking-tight transition-colors duration-300 sm:text-[21px] ${selected ? "text-white" : "text-spotify-near-white"}`}
                    >
                      {f.title}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    className={`shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none ${selected ? "text-spotify-green" : "text-spotify-silver/40"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* Spotlight panel */}
          <div
            id="feature-panel"
            role="tabpanel"
            aria-labelledby={`feature-tab-${active}`}
            className="relative flex min-h-75 flex-col justify-between overflow-hidden rounded-lg border border-white/10 bg-spotify-dark-surface p-8 sm:p-10 lg:col-start-2 lg:row-start-1"
          >
            {/* Keyed content: crossfades on tab change */}
            <div
              key={active}
              className="relative animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none"
            >
              <div className="mb-8 flex items-center">
                <span
                  className="inline-flex h-14 w-14 items-center justify-center rounded-md border border-spotify-green/30 bg-spotify-green/10 text-spotify-green"
                >
                  <CurrentIcon size={26} aria-hidden="true" />
                </span>
              </div>

              <p className="mb-3 text-[13px] font-bold tracking-[0.02em] text-spotify-silver/70">
                {current.summary}
              </p>
              <h3 className="mb-4 text-[30px] font-black tracking-tight text-white sm:text-[36px]">
                {current.title}
              </h3>
              {/* Signature underline, grows in with the content */}
              <span
                aria-hidden="true"
                className="mb-6 block h-0.75 w-16 rounded-full bg-spotify-green"
              />
              <p className="max-w-xl text-[17px] font-medium leading-relaxed text-spotify-silver">
                {current.desc}
              </p>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
