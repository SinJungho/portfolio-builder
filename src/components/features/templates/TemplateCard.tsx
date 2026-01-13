import { Eye } from "lucide-react";

interface Template {
  id: number;
  name: string;
  description: string;
  tags: string[];
}

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all group">
      {/* Preview Thumbnail */}
      <div className="aspect-video bg-gray-100 border-b border-gray-200 relative overflow-hidden">
        {/* Placeholder content to simulate template preview */}
        <div className="p-6 space-y-3">
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-2 bg-gray-200 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-700" />
              <span className="text-sm text-gray-700">Quick Preview</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 space-y-3">
        {/* Template Name */}
        <h3 className="text-gray-900">{template.name}</h3>

        {/* Description */}
        <p className="text-sm text-gray-500 line-clamp-1">
          {template.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="inline-block px-2.5 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm">
            Preview
          </button>
          <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors text-sm">
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}
