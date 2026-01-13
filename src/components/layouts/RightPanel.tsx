import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface RightPanelProps {
  selectedBlock: string | null;
}

export function RightPanel({ selectedBlock }: RightPanelProps) {
  const [activeTab, setActiveTab] = useState<"style" | "settings" | "data">(
    "style"
  );
  const [layoutExpanded, setLayoutExpanded] = useState(true);
  const [typographyExpanded, setTypographyExpanded] = useState(true);
  const [colorsExpanded, setColorsExpanded] = useState(true);
  const [spacingExpanded, setSpacingExpanded] = useState(false);

  if (!selectedBlock) {
    return (
      <aside className="w-[320px] bg-white border-l border-gray-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
            <span className="text-2xl text-gray-400">✨</span>
          </div>
          <p className="text-sm text-gray-500">
            Select a block to edit its properties
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[320px] bg-white border-l border-gray-200 overflow-y-auto">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("style")}
          className={`flex-1 py-3 text-sm transition-colors ${
            activeTab === "style"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Style
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex-1 py-3 text-sm transition-colors ${
            activeTab === "settings"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Settings
        </button>
        <button
          onClick={() => setActiveTab("data")}
          className={`flex-1 py-3 text-sm transition-colors ${
            activeTab === "data"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Data
        </button>
      </div>

      {/* Style Tab Content */}
      {activeTab === "style" && (
        <div>
          {/* Layout Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setLayoutExpanded(!layoutExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">Layout</span>
              {layoutExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {layoutExpanded && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Width
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Top
                    </label>
                    <input
                      type="text"
                      defaultValue="24"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Right
                    </label>
                    <input
                      type="text"
                      defaultValue="24"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Bottom
                    </label>
                    <input
                      type="text"
                      defaultValue="24"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Left
                    </label>
                    <input
                      type="text"
                      defaultValue="24"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Typography Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setTypographyExpanded(!typographyExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">Typography</span>
              {typographyExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {typographyExpanded && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Font Family
                  </label>
                  <select className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900">
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Open Sans</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-1 block">
                    Font Size
                  </label>
                  <input
                    type="text"
                    defaultValue="16"
                    className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Colors Section */}
          <div className="border-b border-gray-200">
            <button
              onClick={() => setColorsExpanded(!colorsExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">Colors</span>
              {colorsExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {colorsExpanded && (
              <div className="px-4 pb-4 space-y-4">
                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Background
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded border border-gray-300 bg-white"></div>
                    <input
                      type="text"
                      defaultValue="#FFFFFF"
                      className="flex-1 h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-600 mb-2 block">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded border border-gray-300 bg-gray-900"></div>
                    <input
                      type="text"
                      defaultValue="#000000"
                      className="flex-1 h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Spacing Section */}
          <div>
            <button
              onClick={() => setSpacingExpanded(!spacingExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm text-gray-900">Spacing</span>
              {spacingExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>

            {spacingExpanded && (
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Margin Top
                    </label>
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Margin Right
                    </label>
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Margin Bottom
                    </label>
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">
                      Margin Left
                    </label>
                    <input
                      type="text"
                      defaultValue="0"
                      className="w-full h-10 px-3 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab Content */}
      {activeTab === "settings" && (
        <div className="p-4">
          <p className="text-sm text-gray-500">Settings panel content</p>
        </div>
      )}

      {/* Data Tab Content */}
      {activeTab === "data" && (
        <div className="p-4">
          <p className="text-sm text-gray-500">Data panel content</p>
        </div>
      )}
    </aside>
  );
}
