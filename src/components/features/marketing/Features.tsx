"use client";

import { Pencil, RefreshCw, Sparkles } from "lucide-react";
import { useState } from "react";

// TODO: IntersectionObserver 또는 Framer Motion과 같은 라이브러리를 사용하여
// 스크롤 위치에 따라 activeFeatureIndex를 동적으로 업데이트하는 로직을 구현해야 합니다.
export function Features() {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0);

  const features = [
    {
      icon: RefreshCw,
      title: "자동 GitHub 동기화",
      description:
        "더 이상 수동으로 업데이트할 필요 없습니다. 당신의 최신 활동이 포트폴리오에 실시간으로 반영됩니다.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "AI 프로젝트 큐레이션",
      description:
        "AI가 당신의 저장소 중에서 가장 인상적인 프로젝트를 자동으로 선별하고, 멋진 설명까지 덧붙여줍니다.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Pencil,
      title: "자유로운 커스터마이징",
      description:
        "AI의 추천이 마음에 들지 않나요? 실시간 편집기로 당신의 포트폴리오를 원하는 대로 수정하고 다듬을 수 있습니다.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  const Visuals = () => (
    <div className="w-full h-full rounded-3xl bg-gray-200 p-8 flex items-center justify-center transition-all duration-500">
      {/* TODO: activeFeatureIndex에 따라 다른 비주얼을 보여주는 로직 구현 */}
      <div
        className={`w-full h-full rounded-2xl bg-linear-to-br ${features[activeFeatureIndex].gradient} transition-all duration-500`}
      ></div>
    </div>
  );

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tighter text-gray-900 mb-4">
            당신이 상상하는 모든 것,
            <br />그 이상을 담아내세요
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            단순한 목록 그 이상입니다. PortfolioForge의 강력한 기능들은 당신의
            작업물을 매력적인 스토리로 바꿔줍니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-start">
          <div className="lg:sticky top-24">
            <div className="w-full aspect-square relative">
              <Visuals />
            </div>
          </div>
          <div className="space-y-16 md:space-y-24">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="space-y-4"
                  // onMouseOver={() => setActiveFeatureIndex(index)} // 임시 로직
                >
                  <div
                    className={`w-12 h-12 bg-linear-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-lg">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
