export function BreakdownGrid() {
  const topProjects = [
    { name: "E-commerce Platform", views: 2847, percentage: 100 },
    { name: "Weather Dashboard", views: 1923, percentage: 67 },
    { name: "Task Manager", views: 1456, percentage: 51 },
    { name: "Portfolio Website", views: 982, percentage: 34 },
    { name: "Chat Application", views: 743, percentage: 26 },
  ];

  const trafficSources = [
    { name: "GitHub", visitors: 1234, percentage: 32 },
    { name: "LinkedIn", visitors: 987, percentage: 26 },
    { name: "Direct", visitors: 765, percentage: 20 },
    { name: "Twitter", visitors: 543, percentage: 14 },
    { name: "Other", visitors: 318, percentage: 8 },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Top Projects */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-6">Top Projects</h3>

        <div className="space-y-4">
          {topProjects.map((project) => (
            <div key={project.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-700">{project.name}</span>
                <span className="text-sm text-gray-900">
                  {project.views.toLocaleString()}
                </span>
              </div>

              {/* Horizontal bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gray-400 rounded-full"
                  style={{ width: `${project.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Traffic Sources */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-6">Traffic Sources</h3>

        <div className="space-y-4">
          {trafficSources.map((source) => (
            <div
              key={source.name}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-700">{source.name}</span>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-900">
                  {source.visitors.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 w-12 text-right">
                  {source.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
