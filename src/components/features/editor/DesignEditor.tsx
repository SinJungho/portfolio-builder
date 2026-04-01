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
import { Palette, Type, Square, ArrowUpDown, Check } from "lucide-react";

const fontOptions = [
  { id: "inter", name: "Inter (기본)", desc: "깔끔하고 현대적인 산세리프" },
  { id: "pretendard", name: "Pretendard", desc: "가독성 높은 한글 폰트" },
  { id: "fira-code", name: "Fira Code", desc: "개발자 감성의 고정폭 폰트" },
  { id: "playfair", name: "Playfair Display", desc: "우아하고 클래식한 세리프" },
];

const radiusOptions = [
  { id: "none", name: "None (직각형)", value: "0px" },
  { id: "sm", name: "Small (약간 둥글게)", value: "8px" },
  { id: "md", name: "Medium (표준)", value: "16px" },
  { id: "lg", name: "Large (부드럽게)", value: "24px" },
  { id: "full", name: "Full (완전 둥글게)", value: "9999px" },
];

const spacingOptions = [
  { id: "compact", name: "Compact (좁게)", desc: "콘텐츠를 밀도 있게 표시" },
  { id: "normal", name: "Normal (표준)", desc: "쾌적한 가독성 제공" },
  { id: "relaxed", name: "Relaxed (넓게)", desc: "여유롭고 고급스러운 느낌" },
];

export default function DesignEditor() {
  const { theme, setTheme, designTokens, setDesignTokens } = usePortfolioStore();

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* 1. Theme Selection */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-extrabold text-[#191F28]">테마 프리셋</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                group relative flex flex-col gap-3 p-4 border rounded-2xl transition-all text-left overflow-hidden
                ${theme === t.id 
                  ? "border-[#3182F6] bg-blue-50/30 ring-1 ring-[#3182F6]" 
                  : "hover:border-blue-200 hover:bg-blue-50/10 border-black/5 bg-white"}
              `}
            >
              <div className="flex items-center justify-between z-10">
                <span className={`text-[13px] font-bold ${theme === t.id ? "text-[#3182F6]" : "text-gray-500"}`}>
                  {t.label}
                </span>
                {theme === t.id && <Check className="w-4 h-4 text-[#3182F6]" />}
              </div>
              <div className="flex gap-1 h-3 w-full z-10">
                <div className="flex-1 rounded-[2px]" style={{ backgroundColor: t.bg }} />
                <div className="flex-1 rounded-[2px]" style={{ backgroundColor: t.accent }} />
                <div className="flex-1 rounded-[2px]" style={{ backgroundColor: t.text }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Color Customization */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-linear-to-tr from-blue-500 to-purple-500" />
          <h3 className="text-lg font-extrabold text-[#191F28]">강조 색상 (Primary)</h3>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 border border-black/5 rounded-2xl">
          <div 
            className="w-12 h-12 rounded-xl shadow-inner border border-black/5 shrink-0"
            style={{ backgroundColor: designTokens?.primaryColor || THEMES[theme]?.accent || "#3182F6" }}
          />
          <div className="flex-1 space-y-1">
            <Label htmlFor="primaryColor" className="text-xs font-bold text-gray-400">HEX CODE</Label>
            <Input
              id="primaryColor"
              type="text"
              value={designTokens?.primaryColor || THEMES[theme]?.accent || "#3182F6"}
              onChange={(e) => updateToken("primaryColor", e.target.value)}
              className="h-9 border-none bg-gray-50 font-mono text-sm focus-visible:ring-1 focus-visible:ring-blue-100"
            />
          </div>
          <input 
            type="color" 
            className="w-8 h-8 rounded-full border-none p-0 cursor-pointer overflow-hidden" 
            value={designTokens?.primaryColor || THEMES[theme]?.accent || "#3182F6"}
            onChange={(e) => updateToken("primaryColor", e.target.value)}
          />
        </div>
        <p className="text-xs text-center text-gray-400 font-medium">다크 테마를 포함한 모든 레이아웃의 강조색을 변경합니다.</p>
      </section>

      {/* 3. Typography */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-gray-500" />
          <h3 className="text-lg font-extrabold text-[#191F28]">타이포그래피</h3>
        </div>
        <Select 
          value={designTokens?.fontFamily || "inter"} 
          onValueChange={(v) => updateToken("fontFamily", v)}
        >
          <SelectTrigger className="h-12 rounded-2xl border-black/5 bg-white shadow-sm font-bold">
            <SelectValue placeholder="폰트 선택" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl shadow-xl border-black/5">
            {fontOptions.map((f) => (
              <SelectItem key={f.id} value={f.id} className="py-3 rounded-xl focus:bg-blue-50">
                <div className="flex flex-col">
                  <span className="font-bold text-[#191F28]">{f.name}</span>
                  <span className="text-[11px] text-gray-400">{f.desc}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      {/* 4. Shape & Spacing */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Square className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-extrabold text-[#191F28]">라운드처리</h3>
          </div>
          <Select 
            value={designTokens?.borderRadius || "md"} 
            onValueChange={(v) => updateToken("borderRadius", v)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-black/5 bg-white shadow-sm font-bold">
              <SelectValue placeholder="반경 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-black/5">
              {radiusOptions.map((r) => (
                <SelectItem key={r.id} value={r.id} className="rounded-xl">
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-gray-500" />
            <h3 className="text-lg font-extrabold text-[#191F28]">섹션 간격</h3>
          </div>
          <Select 
            value={designTokens?.spacing || "normal"} 
            onValueChange={(v) => updateToken("spacing", v)}
          >
            <SelectTrigger className="h-12 rounded-2xl border-black/5 bg-white shadow-sm font-bold">
              <SelectValue placeholder="간격 선택" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl shadow-xl border-black/5">
              {spacingOptions.map((s) => (
                <SelectItem key={s.id} value={s.id} className="py-3 rounded-xl focus:bg-blue-50">
                  <div className="flex flex-col">
                    <span className="font-bold text-[#191F28]">{s.name}</span>
                    <span className="text-[11px] text-gray-400">{s.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>
    </div>
  );
}
