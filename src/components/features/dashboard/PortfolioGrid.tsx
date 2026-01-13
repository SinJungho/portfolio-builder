import { MoreVertical, Plus } from "lucide-react";

export function PortfolioGrid() {
  const portfolios = [
    {
      id: 1,
      name: "Main Portfolio",
      status: "Published",
      lastUpdated: "2 hours ago",
    },
    {
      id: 2,
      name: "Side Projects Showcase",
      status: "Published",
      lastUpdated: "1 day ago",
    },
    {
      id: 3,
      name: "Frontend Work",
      status: "Draft",
      lastUpdated: "3 days ago",
    },
    {
      id: 4,
      name: "Open Source Contributions",
      status: "Published",
      lastUpdated: "1 week ago",
    },
    {
      id: 5,
      name: "Design Projects",
      status: "Draft",
      lastUpdated: "2 weeks ago",
    },
  ];

  return (
    <div>
      <h2 className="text-gray-900 mb-4">All Portfolios</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* Existing portfolios */}
        {portfolios.map((portfolio) => (
          <div
            key={portfolio.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow group"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-gray-100 border-b border-gray-200 flex items-center justify-center relative">
              <span className="text-gray-400 text-sm">Portfolio Preview</span>

              {/* Three-dot menu */}
              <button className="absolute top-3 right-3 w-8 h-8 bg-white rounded-md border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50">
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-gray-900 mb-2">{portfolio.name}</h3>

              <div className="flex items-center justify-between">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs ${
                    portfolio.status === "Published"
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {portfolio.status}
                </span>

                <span className="text-xs text-gray-500">
                  Updated {portfolio.lastUpdated}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg aspect-3/4 hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <Plus className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
            Create New Portfolio
          </span>
        </button>
      </div>
    </div>
  );
}
