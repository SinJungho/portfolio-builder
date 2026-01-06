import { Sparkles } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-16 border-t border-gray-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full">
            <Sparkles className="w-8 h-8 text-gray-600" />
          </div>

          <div>
            <h2 className="text-gray-900 mb-2">
              Can&apos;t find what you need?
            </h2>
            <p className="text-gray-600">
              Start with a blank canvas and build your portfolio from scratch
            </p>
          </div>

          <button className="px-6 py-3 border-2 border-gray-900 text-gray-900 rounded-lg hover:bg-gray-900 hover:text-white transition-all">
            Start from Scratch
          </button>
        </div>
      </div>
    </section>
  );
}
