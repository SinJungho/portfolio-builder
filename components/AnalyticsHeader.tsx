import { Calendar, ChevronDown } from "lucide-react";

export function AnalyticsHeader() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-gray-900">Analytics</h1>

        <div className="flex items-center gap-3">
          {/* Portfolio Selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">All Portfolios</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Date Range Selector */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <Calendar className="w-4 h-4 text-gray-600" />
              <span className="text-sm text-gray-700">Last 30 days</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
