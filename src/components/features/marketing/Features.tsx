import { Pencil, RefreshCw, Sparkles } from "lucide-react";

export function Features() {
  const features = [
    {
      icon: RefreshCw,
      title: "자동 GitHub 동기화",
      description: "프로젝트 및 기여가 실시간으로 업데이트됩니다",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "AI 프로젝트 큐레이션",
      description: "가장 뛰어난 작업을 자동으로 강조합니다",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Pencil,
      title: "실시간 에디터",
      description: "포트폴리오를 즉시 편집하고 미리 봅니다",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-300 mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-4">
            작업을 선보이는 데 필요한 모든 것
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            개발자를 위해 포트폴리오 관리를 쉽게 할 수 있도록 설계된 강력한 기능
          </p>
        </div>

        <div className="grid grid-cols-3 gap-8">
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

                  <h3 className="text-gray-900">{feature.title}</h3>

                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
