import { ArrowRight, Github, Play } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 opacity-60"></div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

      <div className="relative max-w-300 mx-auto px-6">
        <div className="grid grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-sm">Now with AI-powered curation</span>
            </div>

            <h1 className="text-gray-900 leading-tight">
              Developers focus on code.
              <br />
              <span className="bg-linear-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                We build the portfolio.
              </span>
            </h1>

            <p className="text-gray-600 text-lg max-w-md">
              Automatically generate and maintain a live developer portfolio
              using your GitHub data.
            </p>

            <div className="flex items-center gap-4">
              <button className="group bg-gray-900 text-white px-6 py-3.5 rounded-lg hover:bg-gray-800 transition-all hover:shadow-xl flex items-center gap-2">
                <Github className="w-5 h-5" />
                Continue with GitHub
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors px-4 py-3.5">
                <Play className="w-4 h-4" />
                View Live Demo
              </button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl text-gray-900">10K+</div>
                <div className="text-sm text-gray-500">Portfolios created</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div>
                <div className="text-2xl text-gray-900">50M+</div>
                <div className="text-sm text-gray-500">
                  GitHub events synced
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Portfolio Preview */}
          <div className="relative">
            <div className="absolute -inset-4 bg-linear-to-br from-indigo-500 to-purple-600 rounded-2xl opacity-20 blur-2xl"></div>
            <div className="relative bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="flex-1 bg-white rounded px-3 py-1 text-xs text-gray-500 ml-2">
                  portfolioforge.dev/demo
                </div>
              </div>

              {/* Portfolio content mockup */}
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-gray-100 rounded w-48"></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-100 rounded w-4/6"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded w-16"></div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
                    <div className="h-2 bg-gray-100 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
