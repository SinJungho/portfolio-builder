import { TrendingDown, TrendingUp } from "lucide-react";

export function MetricsGrid() {
  const metrics = [
    {
      label: "Total Views",
      value: "12,543",
      change: "+12.5%",
      trending: "up" as const,
    },
    {
      label: "Unique Visitors",
      value: "3,847",
      change: "+8.2%",
      trending: "up" as const,
    },
    {
      label: "Click-through Rate",
      value: "4.2%",
      change: "-2.1%",
      trending: "down" as const,
    },
    {
      label: "Avg. Session Time",
      value: "2m 34s",
      change: "+15.3%",
      trending: "up" as const,
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="text-gray-500 text-sm mb-2">{metric.label}</div>
          <div className="text-3xl text-gray-900 mb-2">{metric.value}</div>
          <div className="flex items-center gap-1">
            {metric.trending === "up" ? (
              <TrendingUp className="w-4 h-4 text-gray-700" />
            ) : (
              <TrendingDown className="w-4 h-4 text-gray-700" />
            )}
            <span
              className={`text-sm ${
                metric.trending === "up" ? "text-gray-700" : "text-gray-600"
              }`}
            >
              {metric.change}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
