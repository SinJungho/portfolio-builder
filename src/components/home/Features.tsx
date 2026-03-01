"use client";

import { TOSS_BLUE } from "@/lib/validations/color";
import { Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";
import Reveal from "../common/Reveal";

export default function Features() {
  const [active, setActive] = useState(0);

  const features = [
    {
      icon: RefreshCw,
      color: TOSS_BLUE,
      title: "자동 GitHub 동기화",
      desc: "새로운 커밋, 스타, 프로젝트가 생길 때마다 포트폴리오도 자동으로 업데이트돼요. 한 번 설정하면 관리할 필요가 없어요.",
      tag: "자동화",
    },
    {
      icon: Sparkles,
      color: "#8B5CF6",
      title: "AI 프로젝트 큐레이션",
      desc: "모든 저장소를 다 보여줄 필요는 없어요. AI가 채용 담당자 눈에 띄는 핵심 프로젝트를 엄선하고, 설명까지 자동으로 작성해줘요.",
      tag: "AI",
    },
    {
      icon: Pencil,
      color: "#F59E0B",
      title: "실시간 WYSIWYG 편집",
      desc: "코드를 몰라도 괜찮아요. 블록을 드래그하고, 색상을 바꾸고, 문구를 수정하면 실시간으로 결과를 확인할 수 있어요.",
      tag: "편집기",
    },
  ];

  return (
    <section className="bg-white py-30 px-6">
      <div className="max-w-280 mx-auto">
        <Reveal>
          <div className="mb-16">
            <p
              className="text-sm font-semibold mb-3 tracking-[0.5px]"
              style={{ color: TOSS_BLUE }}
            >
              FEATURES
            </p>

            <h2 className="font-extrabold text-[#191F28] tracking-[-1.5px] leading-[1.15] text-[clamp(36px,5vw,56px)] m-0">
              그냥 만드는 게 아니에요
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;

            return (
              <Reveal key={i} delay={i * 100}>
                <button
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`
                    p-9 rounded-3xl cursor-pointer text-left
                    transition-all duration-300 ease-in-out w-full
                  `}
                  style={{
                    background: active === i ? "#FAFAFA" : "white",
                    border: `2px solid ${
                      active === i ? f.color + "30" : "#F0F4F8"
                    }`,
                    transform: active === i ? "translateY(-4px)" : "none",
                    boxShadow:
                      active === i ? `0 16px 48px ${f.color}18` : "none",
                  }}
                >
                  {/* icon */}
                  <div
                    className="w-12 h-12 rounded-[14px] mb-6 flex items-center justify-center"
                    style={{ background: `${f.color}15` }}
                  >
                    <Icon size={22} color={f.color} />
                  </div>

                  {/* tag */}
                  <div
                    className="inline-block px-2.5 py-0.75 rounded-full text-[11px] font-semibold mb-3"
                    style={{
                      background: `${f.color}10`,
                      color: f.color,
                    }}
                  >
                    {f.tag}
                  </div>

                  {/* title */}
                  <h3 className="text-[22px] font-bold text-[#191F28] tracking-[-0.5px] mb-3 m-0">
                    {f.title}
                  </h3>

                  {/* description */}
                  <p className="text-[15px] leading-[1.7] text-gray-500 m-0">
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
