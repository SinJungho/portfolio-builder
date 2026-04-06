"use client";

import { DesignTokens } from "@/schemas/portfolio";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Palette, 
  Type, 
  Square, 
  Layers, 
  Check, 
  Sparkles,
  Info
} from "lucide-react";

interface ThemeSettingsPanelProps {
  tokens: DesignTokens;
  onChange: (newTokens: Partial<DesignTokens>) => void;
  portfolioTitle: string;
}

export default function ThemeSettingsPanel({
  tokens,
  onChange,
  portfolioTitle,
}: ThemeSettingsPanelProps) {
  
  const presets = [
    { name: "Toss Blue", color: "#3182f6" },
    { name: "Teal Green", color: "#00c471" },
    { name: "Soft Purple", color: "#6c5ce7" },
    { name: "Midnight Black", color: "#191f28" },
    { name: "Cherry Red", color: "#f04452" },
  ];

  return (
    <div className="flex flex-col gap-10 p-8">
      {/* Header Info */}
      <div className="space-y-1.5 pt-2">
        <div className="flex items-center gap-2 text-[#3182F6]">
           <Sparkles className="w-4 h-4" />
           <span className="text-[12px] font-bold uppercase tracking-wider">Design Editor</span>
        </div>
        <h2 className="text-[20px] font-extrabold text-[#191F28] tracking-tight">아이덴티티 설정</h2>
        <p className="text-[14px] font-medium text-[#4E5968] leading-relaxed">포트폴리오의 첫인상을 결정하는 핵심 디자인 요소를 선택해 보세요.</p>
      </div>

      {/* Primary Color Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-blue-50 text-[#3182F6] rounded-lg">
             <Palette className="w-4 h-4" />
           </div>
           <Label className="text-[15px] font-extrabold text-[#191F28]">브랜드 컬러</Label>
        </div>
        
        <div className="flex flex-wrap gap-2.5">
           {presets.map((p) => (
             <button
                key={p.color}
                onClick={() => onChange({ primaryColor: p.color })}
                className={`w-9 h-9 rounded-full border-2 transition-all hover:scale-110 active:scale-95 shadow-sm overflow-hidden flex items-center justify-center`}
                style={{ backgroundColor: p.color, borderColor: tokens.primaryColor === p.color ? "#3182F6" : "transparent" }}
                title={p.name}
             >
                {tokens.primaryColor === p.color && <Check className="w-4 h-4 text-white drop-shadow-md" />}
             </button>
           ))}
        </div>

        <div className="relative group">
          <Input
            type="color"
            value={tokens.primaryColor || "#3182F6"}
            onChange={(e) => onChange({ primaryColor: e.target.value })}
            className="h-12 w-full rounded-xl cursor-pointer bg-white border-black/5 hover:border-[#3182F6]/30 transition-all p-1"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[12px] font-bold text-gray-400">
             Custom HEX
          </div>
        </div>
      </section>

      {/* Typography Section */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-gray-50 text-gray-600 rounded-lg">
             <Type className="w-4 h-4" />
           </div>
           <Label className="text-[15px] font-extrabold text-[#191F28]">타이포그래피</Label>
        </div>

        <Select 
          value={tokens.fontFamily || "pretendard"} 
          onValueChange={(val) => onChange({ fontFamily: val as any })}
        >
          <SelectTrigger className="h-12 rounded-xl bg-white border-black/5 font-bold text-[#4E5968] focus:ring-[#3182F6]/10 shadow-sm transition-all">
            <SelectValue placeholder="폰트 선택" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-none shadow-2xl p-2 font-bold text-[#4E5968]">
            <SelectItem value="inter" className="rounded-xl h-11">Inter (Modern English)</SelectItem>
            <SelectItem value="pretendard" className="rounded-xl h-11">Pretendard (Standard KR)</SelectItem>
            <SelectItem value="fira-code" className="rounded-xl h-11 font-mono">Fira Code (Developer)</SelectItem>
            <SelectItem value="playfair" className="rounded-xl h-11 italic">Playfair (Elegant)</SelectItem>
          </SelectContent>
        </Select>
      </section>

      {/* Style Section (Radius & Spacing) */}
      <section className="space-y-5">
        <div className="flex items-center gap-2">
           <div className="p-1.5 bg-gray-50 text-gray-600 rounded-lg">
             <Square className="w-4 h-4" />
           </div>
           <Label className="text-[15px] font-extrabold text-[#191F28]">스타일 디테일</Label>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div className="space-y-2">
              <span className="text-[12px] font-bold text-gray-400 px-1">테두리 곡률</span>
              <Select 
                value={tokens.borderRadius || "md"} 
                onValueChange={(val) => onChange({ borderRadius: val as any })}
              >
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-none font-bold text-[13px] shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl font-bold min-w-[100px]">
                  <SelectItem value="none">Sharp</SelectItem>
                  <SelectItem value="sm">Soft</SelectItem>
                  <SelectItem value="md">Medium</SelectItem>
                  <SelectItem value="lg">Round</SelectItem>
                  <SelectItem value="full">Circle</SelectItem>
                </SelectContent>
              </Select>
           </div>
           <div className="space-y-2">
              <span className="text-[12px] font-bold text-gray-400 px-1">블록 간격</span>
              <Select 
                value={tokens.spacing || "normal"} 
                onValueChange={(val) => onChange({ spacing: val as any })}
              >
                <SelectTrigger className="h-11 rounded-xl bg-gray-50 border-none font-bold text-[13px] shadow-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-none shadow-xl font-bold min-w-[100px]">
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Default</SelectItem>
                  <SelectItem value="relaxed">Relaxed</SelectItem>
                </SelectContent>
              </Select>
           </div>
        </div>
      </section>

      {/* Helper Tip */}
      <div className="bg-[#F2F4F6] rounded-2xl p-5 flex gap-3.5 border border-black/3 mt-6 animate-in slide-in-from-bottom-2 duration-500">
         <Info className="w-5 h-5 text-gray-400 shrink-0" />
         <div className="space-y-1">
            <p className="text-[13px] font-bold text-[#191F28]">실시간 미리보기</p>
            <p className="text-[12px] font-medium text-[#8B95A1] leading-tight">
              좌측에서 설정을 변경하면 오른쪽 화면에 즉시 적용됩니다. 저장하기 전까지는 실제 사이트에 반영되지 않으니 마음껏 테스트해 보세요!
            </p>
         </div>
      </div>
    </div>
  );
}
