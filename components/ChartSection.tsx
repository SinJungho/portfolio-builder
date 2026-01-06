export function ChartSection() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
      <h2 className="text-gray-900 mb-6">Views Over Time</h2>

      {/* Chart Placeholder */}
      <div className="h-[400px] border border-gray-200 rounded bg-gray-50 relative">
        {/* Y-axis label */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 text-sm text-gray-500">
          Views
        </div>

        {/* Chart area with grid lines */}
        <div className="absolute inset-8 flex flex-col justify-between">
          {/* Horizontal grid lines */}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-xs text-gray-400 w-8 text-right">
                {(5 - i) * 2000}
              </span>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>
          ))}
        </div>

        {/* Line chart placeholder - simulated path */}
        <svg
          className="absolute inset-8"
          viewBox="0 0 600 300"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,250 L 100,200 L 200,180 L 300,220 L 400,150 L 500,120 L 600,100"
            fill="none"
            stroke="#9ca3af"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M 0,250 L 100,200 L 200,180 L 300,220 L 400,150 L 500,120 L 600,100 L 600,300 L 0,300 Z"
            fill="#e5e7eb"
            opacity="0.3"
          />
        </svg>

        {/* X-axis label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-gray-500">
          Date
        </div>

        {/* X-axis values */}
        <div className="absolute bottom-8 left-8 right-8 flex justify-between text-xs text-gray-400">
          <span>Jan 1</span>
          <span>Jan 7</span>
          <span>Jan 14</span>
          <span>Jan 21</span>
          <span>Jan 28</span>
        </div>
      </div>
    </div>
  );
}
