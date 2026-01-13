import { ArrowLeft, Eye, Monitor, Smartphone, Tablet } from "lucide-react";
import { useState } from "react";

export function TopToolbar() {
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Left: Back + Portfolio Name */}
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>

        <input
          type="text"
          defaultValue="My Portfolio"
          className="text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded"
        />
      </div>

      {/* Center: View Mode Toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setViewMode("desktop")}
          className={`p-2 rounded transition-colors ${
            viewMode === "desktop" ? "bg-white shadow-sm" : "hover:bg-gray-200"
          }`}
        >
          <Monitor className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => setViewMode("tablet")}
          className={`p-2 rounded transition-colors ${
            viewMode === "tablet" ? "bg-white shadow-sm" : "hover:bg-gray-200"
          }`}
        >
          <Tablet className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => setViewMode("mobile")}
          className={`p-2 rounded transition-colors ${
            viewMode === "mobile" ? "bg-white shadow-sm" : "hover:bg-gray-200"
          }`}
        >
          <Smartphone className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Right: Preview + Publish */}
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Eye className="w-4 h-4" />
          <span className="text-sm">Preview</span>
        </button>

        <button className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
          <span className="text-sm">Publish</span>
        </button>
      </div>
    </header>
  );
}
