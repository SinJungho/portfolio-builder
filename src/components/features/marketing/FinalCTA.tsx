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
            <span className="text-sm">🚀 이미 10,000명 이상의 개발자가 사용 중입니다</span>
          </div>

          <h2 className="text-white max-w-2xl font-bold text-5xl leading-tight">
            지금 바로 당신의 포트폴리오를
            <br />
            자동화하세요
          </h2>

          <p className="text-indigo-100 text-lg max-w-xl">
            수동으로 업데이트하는 번거로움에서 벗어나세요.
            당신이 개발에 집중하는 동안 PortfolioForge가 최신 상태로 유지해 드립니다.
          </p>

          <div className="flex items-center gap-4">
            <button className="group bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl flex items-center gap-2 font-bold text-lg">
              <Github className="w-5 h-5" />
              GitHub로 무료로 시작하기
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-white/80 text-sm pt-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              신용카드 필요 없음
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              평생 무료 체험 가능
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              단 1분 만에 배포
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
