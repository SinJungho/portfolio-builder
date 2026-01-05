import { ArrowRight, Github } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600"></div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:32px_32px]"></div>

      <div className="relative max-w-[1200px] mx-auto px-6">
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full border border-white/30">
            <span className="text-sm">🚀 Join 10,000+ developers</span>
          </div>

          <h2 className="text-white max-w-2xl">
            Automate your developer portfolio today
          </h2>

          <p className="text-indigo-100 text-lg max-w-xl">
            Stop maintaining your portfolio manually. Let PortfolioForge do the
            heavy lifting while you focus on building great projects.
          </p>

          <div className="flex items-center gap-4">
            <button className="group bg-white text-gray-900 px-8 py-4 rounded-lg hover:bg-gray-100 transition-all hover:shadow-2xl flex items-center gap-2">
              <Github className="w-5 h-5" />
              Start Free with GitHub
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="text-white border border-white/30 backdrop-blur-sm bg-white/10 px-8 py-4 rounded-lg hover:bg-white/20 transition-all">
              View Pricing
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
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Free forever for basic features
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Deploy in minutes
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
