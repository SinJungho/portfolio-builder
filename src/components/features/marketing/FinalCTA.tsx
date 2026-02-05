import { ArrowRight, Github } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-600 via-purple-600 to-pink-600"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-position-[32px_32px]"></div>

      <div className="relative max-w-300 mx-auto px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/30">
            <span className="text-sm">🚀 10,000명 이상의 개발자와 함께하세요</span>
          </div>

          <h2 className="text-white max-w-2xl">
            오늘 개발자 포트폴리오를 자동화하세요
          </h2>

          <p className="text-indigo-100 text-lg max-w-xl">
            수동으로 포트폴리오를 관리하는 것을 멈추세요. PortfolioForge가 번거로운 작업을 처리하는 동안 훌륭한 프로젝트를 구축하는 데 집중하세요.
          </p>

          <div className="flex items-center gap-4">
            <button className="group bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl flex items-center gap-2">
              <Github className="w-5 h-5" />
              GitHub로 무료 시작하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="text-white border border-white/30 backdrop-blur-sm bg-white/10 px-8 py-4 rounded-lg hover:bg-white/20 transition-all">
              가격 보기
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 text-white/80 text-sm pt-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              신용카드 불필요
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              기본 기능은 평생 무료
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              몇 분 안에 배포
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
