"use client";

import React, { useState, useRef } from "react";
import { 
  FileText, 
  Eye, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Info,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "프로젝트의 핵심 성과나 기술적인 도전 과제를 마크다운으로 적어주세요.",
  className = "" 
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mdInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".md")) {
      toast.error("마크다운(.md) 파일만 가져올 수 있습니다.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onChange(content);
      toast.success("마크다운 파일 내용을 불러왔습니다.");
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = "";
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("이미지 크기는 최대 5MB까지만 가능합니다.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "업로드 실패");
      }

      const { url, isLocal, message } = await res.json();
      const imageMarkdown = `\n![${file.name}](${url})\n`;
      onChange(value + imageMarkdown);
      
      if (isLocal) {
        toast.info(message, { 
          duration: 6000,
          description: "실제 배포 전에는 Supabase Storage 설정이 필요합니다."
        });
      } else {
        toast.success("이미지가 업로드되었습니다.");
      }
    } catch (error) {
      console.error(error);
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const input = fileInputRef.current;
      if (input) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;
        handleImageUpload({ target: input } as unknown as React.ChangeEvent<HTMLInputElement>);
      }
    }
  };

  return (
    <div className={`flex flex-col border border-black/5 rounded-[24px] overflow-hidden bg-white shadow-sm transition-all duration-300 focus-within:ring-2 focus-within:ring-blue-100 ${className}`}>
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-2 py-1.5 border-b border-black/5 bg-gray-50/50">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab("write")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              activeTab === "write" 
                ? "bg-white text-[#3182F6] shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <FileText className="w-4 h-4" />
            작성하기
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-bold transition-all ${
              activeTab === "preview" 
                ? "bg-white text-[#3182F6] shadow-sm" 
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Eye className="w-4 h-4" />
            미리보기
          </button>
        </div>

        <div className="flex items-center gap-1 pr-2">
          {/* Markdown Import */}
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 rounded-xl text-gray-500 hover:text-[#3182F6] hover:bg-blue-50 text-[12px] font-bold"
            onClick={() => mdInputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5" />
            파일 가져오기
          </Button>
          <input 
            type="file" 
            ref={mdInputRef} 
            className="hidden" 
            accept=".md" 
            onChange={handleFileImport}
          />

          {/* Image Upload */}
          <Button
            variant="ghost"
            size="sm"
            disabled={isUploading}
            className="flex items-center gap-1.5 rounded-xl text-gray-500 hover:text-[#3182F6] hover:bg-blue-50 text-[12px] font-bold"
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImageIcon className="w-3.5 h-3.5" />}
            이미지
          </Button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload}
          />
        </div>
      </div>

      {/* Editor Content */}
      <div className="relative min-h-[160px] flex flex-col">
        {activeTab === "write" ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder={placeholder}
            className="w-full flex-1 p-5 text-[15px] bg-white outline-none resize-none leading-relaxed placeholder:text-gray-300"
          />
        ) : (
          <div className="w-full flex-1 p-5 prose prose-sm max-w-none prose-blue overflow-y-auto">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-300 italic">미리볼 내용이 없습니다.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-5 py-3 border-t border-black/5 bg-gray-50/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
          <Info className="w-3.5 h-3.5 text-gray-300" />
          마크다운(MD) 및 이미지 드래그&드롭 지원
        </div>
        <div className="text-[11px] text-gray-400 font-bold uppercase tracking-tight">
          최대 용량 5MB
        </div>
      </div>
    </div>
  );
}
