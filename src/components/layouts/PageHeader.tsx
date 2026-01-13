"use client";

import { ChevronDown, Grid3x3, List } from "lucide-react";
import { useState } from "react";

export function PageHeader() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <section className="border-b border-gray-200 bg-white">
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        {/* Title and Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-gray-900 mb-3">Choose Your Template</h1>
          <p className="text-gray-600">
            Start with a professional design, customize everything
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between">
          {/* Left: Category Filter */}
          <div className="relative">
            <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors">
              <span className="text-sm text-gray-700">All Templates</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
            {/* Dropdown would go here */}
          </div>

          {/* Right: View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded transition-colors ${
                viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              <Grid3x3 className="w-4 h-4 text-gray-700" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded transition-colors ${
                viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
              }`}
            >
              <List className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
