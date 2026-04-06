import { Pencil, RefreshCw, Sparkles } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: RefreshCw,
      title: "실시간 GitHub 동기화",
      description: "당신의 프로젝트와 커밋 내역이 실시간으로 포트폴리오에 반영됩니다.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "AI 프로젝트 큐레이션",
      description: "수많은 레포지토리 중 당신을 가장 잘 나타내는 핵심 프로젝트를 AI가 선별합니다.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Pencil,
      title: "직관적인 에디터",
      description: "코드 수정 없이 드래그 앤 드롭과 설정만으로 포트폴리오를 자유롭게 편집하세요.",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-300 mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-4 font-bold text-4xl">
            개발자를 위한 최적의 도구
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            포트폴리오 관리에 쏟는 시간을 줄이고, 프로젝트의 가치를 높이는 데 집중하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Gradient background on hover */}
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity`}
                ></div>

                <div className="relative space-y-4">
                  <div
                    className={`w-12 h-12 bg-linear-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-gray-900 font-bold text-xl">{feature.title}</h3>

                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
