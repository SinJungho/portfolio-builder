import { Cpu, Github, Palette, Rocket } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "1",
      icon: Github,
      title: "GitHub 연동",
      description: "GitHub 계정으로 안전하게 로그인하고 데이터를 불러옵니다",
      color: "from-blue-500 to-cyan-500",
    },
    {
      number: "2",
      icon: Cpu,
      title: "프로젝트 분석",
      description: "AI가 당신의 레포지토리와 기여 내역을 정밀하게 분석합니다",
      color: "from-purple-500 to-pink-500",
    },
    {
      number: "3",
      icon: Palette,
      title: "레이아웃 커스텀",
      description: "생성된 포트폴리오를 실시간으로 확인하고 수정할 수 있습니다",
      color: "from-orange-500 to-red-500",
    },
    {
      number: "4",
      icon: Rocket,
      title: "즉시 배포",
      description: "클릭 한 번으로 나만의 프리미엄 포트폴리오가 온라인에 게시됩니다",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-24 bg-linear-to-br from-gray-50 to-gray-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <div className="relative max-w-300 mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-gray-900 mb-4 font-bold text-4xl">
            GitHub에서 포트폴리오까지, 단 몇 분 만에
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            복잡한 설정 없이 4단계만으로 당신의 커리어를 아름답게 시각화하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connection lines (visible on larger screens) */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-linear-to-r from-blue-200 via-purple-200 to-green-200"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-6 space-y-4 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow h-full">
                  <div className="relative">
                    <div
                      className={`w-12 h-12 bg-linear-to-br ${step.color} rounded-xl flex items-center justify-center relative z-10`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div
                      className={`absolute -top-1 -left-1 w-14 h-14 bg-linear-to-br ${step.color} rounded-xl opacity-20 blur-md`}
                    ></div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-indigo-600 mb-1">
                      Step {step.number}
                    </div>
                    <h4 className="text-gray-900 mb-2 font-bold">{step.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
