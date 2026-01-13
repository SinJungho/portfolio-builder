import { Edit2, GripVertical, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CanvasProps {
  selectedBlock: string | null;
  onSelectBlock: (blockId: string | null) => void;
}

export function Canvas({ selectedBlock, onSelectBlock }: CanvasProps) {
  const [zoom, setZoom] = useState(100);

  const blocks = [
    {
      id: "block-1",
      type: "Header Block",
      content: "Hero section with name and tagline",
    },
    {
      id: "block-2",
      type: "Project Grid Block",
      content: "3-column project showcase grid",
    },
    {
      id: "block-3",
      type: "Skills Chart Block",
      content: "Visual skills representation",
    },
  ];

  return (
    <div className="flex-1 overflow-auto bg-gray-100 p-8">
      {/* Canvas Artboard */}
      <div
        className="mx-auto bg-white shadow-lg"
        style={{
          width: `${(1200 * zoom) / 100}px`,
          transform: `scale(${zoom / 100})`,
          transformOrigin: "top center",
        }}
      >
        {/* Drop Zone - Top */}
        <div className="h-16 border-2 border-dashed border-gray-300 m-4 rounded flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer">
          <span className="text-sm text-gray-400">Drop block here</span>
        </div>

        {/* Blocks */}
        {blocks.map((block) => (
          <div key={block.id} className="relative">
            <div
              onClick={() => onSelectBlock(block.id)}
              className={`m-4 p-6 border-2 rounded-lg transition-all cursor-pointer group ${
                selectedBlock === block.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-dashed border-gray-300 hover:border-gray-400"
              }`}
            >
              {/* Block Type Label */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {block.type}
                </span>

                {/* Hover Controls */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    <GripVertical className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    <Edit2 className="w-3.5 h-3.5 text-gray-600" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded hover:bg-red-50 hover:border-red-300 transition-colors">
                    <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-600" />
                  </button>
                </div>
              </div>

              {/* Content Placeholder */}
              <div className="bg-gray-100 rounded p-8 text-center">
                <div className="text-sm text-gray-500">{block.content}</div>
              </div>
            </div>

            {/* Drop Zone - Between blocks */}
            <div className="h-12 border-2 border-dashed border-gray-300 mx-4 rounded flex items-center justify-center opacity-0 hover:opacity-100 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer">
              <span className="text-xs text-gray-400">Drop block here</span>
            </div>
          </div>
        ))}
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-8 right-[340px] flex items-center gap-2 bg-white border border-gray-300 rounded-lg shadow-lg px-2 py-1.5">
        <button
          onClick={() => setZoom(Math.max(50, zoom - 10))}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
        >
          <Minus className="w-4 h-4 text-gray-600" />
        </button>

        <span className="text-sm text-gray-700 min-w-[50px] text-center">
          {zoom}%
        </span>

        <button
          onClick={() => setZoom(Math.min(150, zoom + 10))}
          className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
