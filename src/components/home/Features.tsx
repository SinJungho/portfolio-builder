"use client";

import { ArrowUpRight, Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import Reveal from "../common/Reveal";

const features = [
  {
    icon: RefreshCw,
    color: "#1ed760",
    tag: "연결만 하면 끝",
    title: "커밋하면 자동으로 업데이트",
    summary: "한 번 연결하면 손댈 일이 없어요",
    desc: "커밋, 스타, 새 프로젝트가 생기면 포트폴리오도 자동으로 따라 바뀌어요. 처음 한 번만 연결해두면 돼요.",
  },
  {
    icon: Sparkles,
    color: "#539df5",
    tag: "고르기만 하면 돼요",
    title: "보여줄 프로젝트만 골라서",
    summary: "전부 보여줄 필요는 없으니까",
    desc: "저장소를 전부 나열하지 않아요. 눈에 띄는 프로젝트를 앞에 두고, 설명까지 읽기 좋게 정리해줘요.",
  },
  {
    icon: Pencil,
    color: "#ffa42b",
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
    <section className="bg-spotify-near-black px-6 py-28 sm:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <div className="mb-14 max-w-2xl sm:mb-16">
            <p className="mb-4 text-[14px] font-bold tracking-[0.02em] text-spotify-green">
              이런 게 좋아요
            </p>
            <h2 className="m-0 text-[clamp(36px,5vw,56px)] font-black leading-tight tracking-tight text-white">
              그냥 만들어주고 끝이 아니에요
            </h2>
            <p className="mt-5 text-[16px] font-medium leading-relaxed text-spotify-silver sm:text-[18px]">
              연결만 해두면, 고르고 다듬고 최신으로 맞추는 일까지 알아서 이어져요.
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
                  {/* Traveling accent rail — the signature marker */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-1/2 h-9 w-0.75 -translate-y-1/2 rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
                    style={{
                      background: f.color,
                      opacity: selected ? 1 : 0,
                      transform: `translateY(-50%) scaleY(${selected ? 1 : 0.25})`,
                    }}
                  />
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors duration-300"
                    style={{
                      color: selected ? f.color : "#b3b3b3",
                      borderColor: selected ? `${f.color}80` : "rgba(255,255,255,0.12)",
                      background: selected ? `${f.color}18` : "transparent",
                    }}
                  >
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="mb-1 block text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-300"
                      style={{ color: selected ? f.color : "#8a8a8a" }}
                    >
                      {f.tag}
                    </span>
                    <span
                      className="block truncate text-[19px] font-bold tracking-tight transition-colors duration-300 sm:text-[21px]"
                      style={{ color: selected ? "#ffffff" : "#cbcbcb" }}
                    >
                      {f.title}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={18}
                    className="shrink-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
                    style={{ color: selected ? f.color : "#5c5c5c", opacity: selected ? 1 : 0.6 }}
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
            className="relative flex min-h-75 flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-spotify-dark-surface p-8 sm:p-10 lg:col-start-2 lg:row-start-1"
          >
            {/* Editorial accent hairline (replaces the blurred glow) */}
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px transition-[background] duration-500"
              style={{ background: `linear-gradient(90deg, ${current.color}, transparent 55%)` }}
            />

            {/* Keyed content — crossfades on tab change */}
            <div
              key={active}
              className="relative animate-in fade-in-0 slide-in-from-bottom-3 duration-500 ease-out motion-reduce:animate-none"
            >
              <div className="mb-8 flex items-center justify-between">
                <span
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border"
                  style={{
                    color: current.color,
                    background: `${current.color}18`,
                    borderColor: `${current.color}45`,
                  }}
                >
                  <CurrentIcon size={26} aria-hidden="true" />
                </span>
                <span
                  className="text-[12px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: current.color }}
                >
                  {current.tag}
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
                className="mb-6 block h-0.75 w-16 rounded-full"
                style={{ background: current.color }}
              />
              <p className="max-w-xl text-[17px] font-medium leading-relaxed text-spotify-silver">
                {current.desc}
              </p>
            </div>

            {/* Footer: position + quick navigation */}
            <div className="relative mt-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2" aria-hidden="true">
                {features.map((f, i) => {
                  const selected = active === i;
                  return (
                    <button
                      key={f.tag}
                      type="button"
                      tabIndex={-1}
                      onClick={() => setActive(i)}
                      aria-label={`${f.title} 보기`}
                      className="h-1.5 rounded-full transition-all duration-300 ease-out motion-reduce:transition-none"
                      style={{
                        width: selected ? 28 : 14,
                        background: selected ? f.color : "rgba(255,255,255,0.16)",
                      }}
                    />
                  );
                })}
              </div>
              <span className="shrink-0 text-[12px] font-bold tabular-nums tracking-[0.08em] text-spotify-silver/80">
                {String(active + 1).padStart(2, "0")} / {String(features.length).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
