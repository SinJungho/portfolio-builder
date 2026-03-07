import { MoreVertical, Plus, ExternalLink, Edit2 } from "lucide-react";
import Link from "next/link";

export function PortfolioGrid() {
  const portfolios = [
    {
      id: "demo-1",
      slug: "main",
      name: "Main Portfolio",
      status: "Published",
      lastUpdated: "2025-03-07",
    },
    {
      id: "demo-2",
      slug: "side-projects",
      name: "Side Projects Showcase",
      status: "Draft",
      lastUpdated: "2025-03-06",
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
              <h3 className="text-gray-900 mb-1 font-semibold">{portfolio.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{portfolio.slug}.portfolioforge.app</p>
              
              <div className="flex flex-col gap-2 mb-4">
                <span className="text-xs text-gray-400">
                  마지막 수정: {portfolio.lastUpdated}
                </span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs w-max ${
                    portfolio.status === "Published"
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "bg-gray-100 text-gray-600 font-medium"
                  }`}
                >
                  {portfolio.status}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <Link 
                  href={`/generate/${portfolio.id}?step=review`}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  검토 / 수정
                </Link>
                {portfolio.status === "Published" && (
                  <Link 
                    href={`https://${portfolio.slug}.portfolioforge.app`}
                    target="_blank"
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    배포 URL
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Create New Card */}
        <button className="bg-white border-2 border-dashed border-gray-300 rounded-lg aspect-[3/4] hover:border-gray-400 hover:bg-gray-50 transition-all flex flex-col items-center justify-center gap-3 group">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <Plus className="w-6 h-6 text-gray-600" />
          </div>
          <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
            새 포트폴리오 만들기
          </span>
        </button>
      </div>
    </div>
  );
}
