import { ArrowRight, Github } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-20 md:py-32 bg-gray-900 text-white">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <div className="flex flex-col items-center gap-6 md:gap-8">
          <h2 className="text-4xl md:text-7xl font-bold tracking-tighter max-w-2xl">
            지금 바로, 당신의 커리어를 위한 최고의 투자를 시작하세요
          </h2>

          <p className="text-base md:text-lg text-gray-300 max-w-xl">
            단 한 번의 클릭으로 당신의 GitHub는 단순한 코드 저장소에서 잠재력을
            보여주는 강력한 포트폴리오로 진화합니다.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button className="group bg-white text-gray-900 px-6 py-3.5 rounded-lg hover:bg-gray-200 transition-all text-base md:text-lg flex items-center gap-3">
              <Github className="w-5 h-5" />
              GitHub로 무료 시작하기
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <p className="text-sm text-gray-500">
            기본 기능은 언제나 무료입니다.
          </p>
        </div>
      </div>
    </section>
  );
}
