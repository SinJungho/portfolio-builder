import {
  BarChart2,
  ChevronDown,
  ChevronRight,
  Code,
  Grid3x3,
  GripVertical,
  Heading,
  Mail,
} from "lucide-react";
import { useState } from "react";

export function LeftSidebar() {
  const [blocksExpanded, setBlocksExpanded] = useState(true);
  const [sectionsExpanded, setSectionsExpanded] = useState(true);

  const blockTypes = [
    { icon: Heading, label: "Header Block" },
    { icon: Grid3x3, label: "Project Grid Block" },
    { icon: BarChart2, label: "Skills Chart Block" },
    { icon: Mail, label: "Contact Form Block" },
    { icon: Code, label: "Custom HTML Block" },
  ];

  const sections = [
    { id: 1, name: "Hero Section" },
    { id: 2, name: "Projects" },
    { id: 3, name: "About Me" },
  ];

  return (
    <aside className="w-[280px] bg-white border-r border-gray-200 overflow-y-auto">
      {/* Blocks Section */}
      <div className="border-b border-gray-200">
        <button
          onClick={() => setBlocksExpanded(!blocksExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm text-gray-900">Blocks</span>
          {blocksExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {blocksExpanded && (
          <div className="p-2 space-y-1">
            {blockTypes.map((block) => {
              const Icon = block.icon;
              return (
                <div
                  key={block.label}
                  draggable
                  className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 cursor-move transition-colors group"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                    <Icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm text-gray-700 flex-1">
                    {block.label}
                  </span>
                  <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sections */}
      <div>
        <button
          onClick={() => setSectionsExpanded(!sectionsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
        >
          <span className="text-sm text-gray-900">Sections</span>
          {sectionsExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {sectionsExpanded && (
          <div className="p-2 space-y-1">
            {sections.map((section) => (
              <div
                key={section.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <GripVertical className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="text-sm text-gray-700 flex-1">
                  {section.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
