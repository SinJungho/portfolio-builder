"use client";

import React from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { THEMES } from "@/preview/themes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Palette, Type, Square, ArrowUpDown, Check, Sparkles } from "lucide-react";

const fontOptions = [
  { id: "inter", name: "Inter", desc: "현대적이고 기하학적인 산세리프" },
  { id: "pretendard", name: "Pretendard", desc: "가장 대중적인 표준 한글 서체" },
  { id: "fira-code", name: "Fira Code", desc: "코딩 감성의 고정폭 폰트" },
  { id: "playfair", name: "Playfair Display", desc: "우아하고 고전적인 세리프" },
];

const radiusOptions = [
  { id: "none", name: "None", desc: "각진 모서리" },
  { id: "sm", name: "Small", desc: "약간의 곡선" },
  { id: "md", name: "Medium", desc: "부드러운 표준" },
  { id: "lg", name: "Large", desc: "둥글고 현대적" },
  { id: "full", name: "Full", desc: "완전한 캡슐" },
];

const spacingOptions = [
  { id: "compact", name: "Compact", desc: "밀도 있는 구성" },
  { id: "normal", name: "Normal", desc: "여유로운 가독성" },
  { id: "relaxed", name: "Relaxed", desc: "고급스러운 공간감" },
];

export default function DesignEditor() {
  const { theme, setTheme, designTokens, setDesignTokens } = usePortfolioStore();

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  const primaryColor = designTokens?.primaryColor || THEMES[theme]?.accent || "#3182F6";

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* 1. Theme Selection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 rounded-2xl">
              <Palette className="w-5 h-5 text-[#3182F6]" />
            </div>
            <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#191F28] tracking-tight">
              테마 스타일
            </h3>
          </div>
          <span className="text-[13px] font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Preset</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                group relative flex flex-col gap-4 p-5 border rounded-[28px] transition-all duration-300 text-left overflow-hidden
                ${theme === t.id 
                  ? "border-[#3182F6] bg-blue-50/20 ring-1 ring-[#3182F6] shadow-[0_8px_20px_rgba(49,130,246,0.08)]" 
                  : "hover:border-gray-200 hover:bg-gray-50/50 border-black/5 bg-white shadow-sm"}
                active:scale-[0.97]
              `}
            >
              <div className="flex items-center justify-between z-10 w-full">
                <span className={`text-[14px] font-bold ${theme === t.id ? "text-[#3182F6]" : "text-[#4E5968]"}`}>
                  {t.label}
                </span>
                {theme === t.id && (
                  <div className="w-5 h-5 rounded-full bg-[#3182F6] flex items-center justify-center">
                    <Check className="w-3 h-3 text-white stroke-[3px]" />
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 h-5 w-full z-10">
                <div className="flex-1 rounded-md border border-black/5" style={{ backgroundColor: t.bg }} />
                <div className="flex-1 rounded-md border border-black/5" style={{ backgroundColor: t.accent }} />
                <div className="flex-1 rounded-md border border-black/5" style={{ backgroundColor: t.text }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Color Customization */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 rounded-2xl">
            <Sparkles className="w-5 h-5 text-purple-500" />
          </div>
          <h3 className="text-[18px] sm:text-[20px] font-extrabold text-[#191F28] tracking-tight">
            포인트 컬러
          </h3>
        </div>

        <div className="bg-white p-6 border border-black/5 rounded-[32px] shadow-sm space-y-6">
          <div className="flex items-center gap-6">
            <div 
              className="w-16 h-16 rounded-[24px] shadow-inner border border-black/5 shrink-0 transition-transform duration-500"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="primaryColor" className="text-[13px] font-bold text-gray-400 uppercase tracking-wider">Accent Color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="primaryColor"
                  type="text"
                  value={primaryColor}
                  onChange={(e) => updateToken("primaryColor", e.target.value)}
                  className="h-11 border-none bg-gray-50 rounded-xl font-mono text-[14px] font-bold text-[#191F28] focus-visible:ring-2 focus-visible:ring-blue-100"
                />
                <div className="relative">
                  <input 
                    type="color" 
                    className="w-11 h-11 rounded-xl border-none p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10" 
                    value={primaryColor}
                    onChange={(e) => updateToken("primaryColor", e.target.value)}
                  />
                  <div 
                    className="w-11 h-11 rounded-xl border border-black/5 flex items-center justify-center transition-transform active:scale-90"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl">
            <p className="text-[13px] text-[#4E5968] font-medium leading-relaxed">
              버튼, 링크, 프로필 강조 등 사이트 전체의 <strong>핵심 브랜드 컬러</strong>를 변경합니다. 테마 프리셋의 기본 색상보다 우선 적용됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Typography & Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-50 rounded-xl">
               <Type className="w-4 h-4 text-gray-500" />
             </div>
             <h4 className="text-[16px] font-extrabold text-[#191F28]">폰트 스타일</h4>
          </div>
          <Select 
            value={designTokens?.fontFamily || "inter"} 
            onValueChange={(v) => updateToken("fontFamily", v)}
          >
            <SelectTrigger className="h-14 rounded-2xl border-black/5 bg-white shadow-sm font-bold text-[#191F28] hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="폰트 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-black/5 p-2">
              {fontOptions.map((f) => (
                <SelectItem key={f.id} value={f.id} className="py-3 rounded-xl focus:bg-blue-50 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#191F28]">{f.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium">{f.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spacing */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-50 rounded-xl">
               <ArrowUpDown className="w-4 h-4 text-gray-500" />
             </div>
             <h4 className="text-[16px] font-extrabold text-[#191F28]">섹션 여백</h4>
          </div>
          <Select 
            value={designTokens?.spacing || "normal"} 
            onValueChange={(v) => updateToken("spacing", v)}
          >
            <SelectTrigger className="h-14 rounded-2xl border-black/5 bg-white shadow-sm font-bold text-[#191F28] hover:bg-gray-50 transition-colors">
              <SelectValue placeholder="여백 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-black/5 p-2">
              {spacingOptions.map((s) => (
                <SelectItem key={s.id} value={s.id} className="py-3 rounded-xl focus:bg-blue-50 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#191F28]">{s.name}</span>
                    <span className="text-[11px] text-gray-400 font-medium">{s.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-4 col-span-full">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gray-50 rounded-xl">
               <Square className="w-4 h-4 text-gray-500" />
             </div>
             <h4 className="text-[16px] font-extrabold text-[#191F28]">라운드처리</h4>
          </div>
          <div className="grid grid-cols-5 gap-2 bg-gray-50 p-2 rounded-2xl border border-black/5">
            {radiusOptions.map((r) => (
              <button
                key={r.id}
                onClick={() => updateToken("borderRadius", r.id)}
                className={`
                  flex flex-col items-center justify-center py-4 rounded-xl transition-all
                  ${(designTokens?.borderRadius || "md") === r.id 
                    ? "bg-white text-[#3182F6] shadow-sm font-bold scale-[1.05] ring-1 ring-black/5" 
                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50 font-medium"}
                `}
              >
                <div 
                  className={`w-6 h-6 border-2 mb-2 transition-all ${ (designTokens?.borderRadius || "md") === r.id ? "border-[#3182F6]" : "border-gray-300"}`}
                  style={{ borderRadius: r.id === 'none' ? '0px' : r.id === 'sm' ? '4px' : r.id === 'md' ? '8px' : r.id === 'lg' ? '12px' : '99px' }}
                />
                <span className="text-[12px]">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
