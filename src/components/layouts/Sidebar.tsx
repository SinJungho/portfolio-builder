import { BarChart3, FolderOpen, Home, Layout, Settings } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  const navItems = [
    { icon: Home, label: "Home", active: false },
    { icon: FolderOpen, label: "My Portfolios", active: true },
    { icon: Layout, label: "Templates", active: false },
    { icon: BarChart3, label: "Analytics", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <span className="text-gray-900">PortfolioForge</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.label}>
                <Link
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                    item.active
                      ? "bg-gray-100 text-gray-900 border-l-2 border-gray-900 -ml-0.5"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300"></div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 truncate">John Developer</div>
            <div className="text-xs text-gray-500 truncate">
              john@example.com
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
