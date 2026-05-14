"use client";

import { Pencil, RefreshCw, Sparkles } from "lucide-react";
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <Reveal key={i} delay={i * 100}>
                <button
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`
                    p-10 rounded-[32px] cursor-pointer text-left
                    transition-all duration-500 ease-out w-full h-full
                    border border-white/5 relative overflow-hidden group
                  `}
                  style={{
                    background: active === i ? "#1f1f1f" : "#181818",
                    transform: active === i ? "translateY(-8px)" : "none",
                    boxShadow: active === i ? "0 16px 48px rgba(0,0,0,0.4)" : "none",
                  }}
                >
                  {/* Glow effect on active */}
                  {active === i && (
                    <div 
                      className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 blur-3xl pointer-events-none"
                      style={{ background: f.color }}
                    />
                  )}

                  {/* icon */}
                  <div
                    className="w-14 h-14 rounded-2xl mb-8 flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                    style={{ 
                      background: active === i ? `${f.color}20` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${active === i ? f.color + "40" : "rgba(255,255,255,0.1)"}`
                    }}
                  >
                    <Icon size={26} color={active === i ? f.color : "#b3b3b3"} strokeWidth={2.5} />
                  </div>

                  {/* tag */}
                  <div
                    className="inline-block px-4 py-1.5 rounded-full text-[12px] font-bold mb-4 uppercase tracking-spotify"
                    style={{
                      background: active === i ? `${f.color}15` : "rgba(255,255,255,0.05)",
                      color: active === i ? f.color : "#b3b3b3",
                    }}
                  >
                    {f.tag}
                  </div>

                  {/* title */}
                  <h3 className="text-[24px] font-black text-white tracking-tight mb-4 m-0 leading-tight">
                    {f.title}
                  </h3>

                  {/* description */}
                  <p className="text-[16px] leading-relaxed text-spotify-silver font-medium m-0">
                    {f.desc}
                  </p>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
