"use client";

import { FolderOpen, Home, Settings, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { icon: Home, label: "대시보드", href: "/dashboard" },
    { icon: FolderOpen, label: "프로젝트", href: "/projects" },
    { icon: Settings, label: "설정", href: "/settings" },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
      {/* Logo */}
      <div className="h-20 flex items-center px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-black rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold text-lg">P</span>
          </div>
          <span className="text-gray-900 font-bold text-xl tracking-tight">PortfolioForge</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-10 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    isActive
                      ? "bg-gray-900 text-white shadow-lg shadow-gray-200"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}`} />
                    <span className="text-[15px] font-semibold">{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4 text-gray-400" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-6 mt-auto">
        <div className="bg-gray-50 rounded-3xl p-4 flex items-center gap-3 border border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-gray-900 truncate">John Developer</div>
            <div className="text-[11px] text-gray-400 truncate">Pro Plan</div>
          </div>
          <button className="text-gray-400 hover:text-red-500 transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
