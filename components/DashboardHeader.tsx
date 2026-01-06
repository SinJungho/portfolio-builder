import { Plus } from "lucide-react";

export function DashboardHeader() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
      <h1 className="text-gray-900">My Portfolios</h1>

      <button className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors">
        <Plus className="w-4 h-4" />
        <span className="text-sm">New Portfolio</span>
      </button>
    </header>
  );
}
