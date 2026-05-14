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
import { Palette, Type, Square, ArrowUpDown, Check, Sparkles, AlertTriangle, Code } from "lucide-react";
import { getContrastRatio } from "@/utils/accessibility";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

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

  const currentTheme = THEMES[theme] || THEMES.minimal;
  const primaryColor = designTokens?.primaryColor || currentTheme?.accent || "#1ed760";

  // 대비도 체크 (배경색, 텍스트색, 보조 텍스트색 기준)
  const contrastBg = getContrastRatio(primaryColor, currentTheme.bg);
  const contrastText = getContrastRatio(primaryColor, currentTheme.text);
  const contrastMuted = getContrastRatio(primaryColor, currentTheme.textMuted);

  const hasA11yIssue = contrastBg < 4.5 || contrastText < 4.5 || contrastMuted < 4.5;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-700 pb-20">
      {/* Accessibility Alert */}
      {hasA11yIssue && (
        <Alert variant="destructive" className="bg-spotify-warning/10 border-spotify-warning/20 text-spotify-warning rounded-xl py-6 px-7 shadow-spotify-md animate-in zoom-in-95 duration-500">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-spotify-warning/20 rounded-full mt-0.5">
              <AlertTriangle className="h-5 w-5 text-spotify-warning" />
            </div>
            <div className="space-y-2">
              <AlertTitle className="text-[16px] font-bold tracking-tight">가독성이 낮을 수 있습니다</AlertTitle>
              <AlertDescription className="text-[13px] font-medium leading-relaxed opacity-90">
                현재 선택한 컬러는 테마 색상과 대비가 낮아 텍스트를 읽기 어려울 수 있습니다. 
                <span className="block mt-1 sm:inline sm:ml-1 underline underline-offset-4 decoration-spotify-warning/30 font-bold">
                  최소 4.5:1 이상의 대비도를 권장합니다.
                </span>
                <div className="flex gap-4 mt-3 pt-3 border-t border-spotify-warning/10">
                  <div className="text-[11px] font-bold uppercase tracking-spotify text-spotify-warning/80">Ratios:</div>
                  <div className="flex gap-3 text-[12px] font-mono font-bold">
                    <span className={contrastBg < 4.5 ? "text-spotify-negative" : "text-spotify-green"}>BG: {contrastBg.toFixed(1)}</span>
                    <span className={contrastText < 4.5 ? "text-spotify-negative" : "text-spotify-green"}>Text: {contrastText.toFixed(1)}</span>
                    <span className={contrastMuted < 4.5 ? "text-spotify-negative" : "text-spotify-green"}>Muted: {contrastMuted.toFixed(1)}</span>
                  </div>
                </div>
              </AlertDescription>
            </div>
          </div>
        </Alert>
      )}

      {/* 1. Theme Selection */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/5 rounded-full">
              <Palette className="w-5 h-5 text-spotify-green" />
            </div>
            <h3 className="text-[20px] font-bold text-white tracking-tight">
              테마 스타일
            </h3>
          </div>
          <span className="text-[11px] font-bold text-spotify-silver bg-white/5 px-3 py-1 rounded-full uppercase tracking-spotify">Preset</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {Object.values(THEMES).map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                group relative flex flex-col gap-5 p-6 rounded-xl transition-all duration-300 text-left overflow-hidden border border-transparent
                ${theme === t.id 
                  ? "bg-spotify-mid-dark shadow-spotify-md border-white/10" 
                  : "bg-spotify-dark-surface hover:bg-spotify-mid-dark"}
                active:scale-[0.98]
              `}
            >
              <div className="flex items-center justify-between z-10 w-full">
                <span className={`text-[15px] font-bold ${theme === t.id ? "text-spotify-green" : "text-spotify-silver group-hover:text-white"}`}>
                  {t.label}
                </span>
                {theme === t.id && (
                  <div className="w-5 h-5 rounded-full bg-spotify-green flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-black stroke-[3px]" />
                  </div>
                )}
              </div>
              <div className="flex gap-1.5 h-6 w-full z-10">
                <div className="flex-1 rounded-md border border-white/5" style={{ backgroundColor: t.bg }} />
                <div className="flex-1 rounded-md border border-white/5" style={{ backgroundColor: t.accent }} />
                <div className="flex-1 rounded-md border border-white/5" style={{ backgroundColor: t.text }} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 2. Color Customization */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
          <div className="p-2.5 bg-white/5 rounded-full">
            <Sparkles className="w-5 h-5 text-spotify-green" />
          </div>
          <h3 className="text-[20px] font-bold text-white tracking-tight">
            포인트 컬러
          </h3>
        </div>

        <div className="bg-spotify-dark-surface p-8 rounded-2xl shadow-spotify-md border border-white/5 space-y-8">
          <div className="flex items-center gap-8">
            <div 
              className="w-20 h-20 rounded-full shadow-spotify border border-white/10 shrink-0 transition-transform duration-500"
              style={{ backgroundColor: primaryColor }}
            />
            <div className="flex-1 space-y-2">
              <Label htmlFor="primaryColor" className="text-[12px] font-bold text-spotify-silver uppercase tracking-spotify">Accent Color</Label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Input
                    id="primaryColor"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => updateToken("primaryColor", e.target.value)}
                    className="h-12 border-none bg-spotify-near-black rounded-full font-mono text-[14px] font-bold text-white pl-12 pr-4 focus-visible:ring-1 focus-visible:ring-spotify-green shadow-inner"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <div className="relative">
                      <input 
                        type="color" 
                        className="w-7 h-7 rounded-full border-none p-0 cursor-pointer overflow-hidden opacity-0 absolute inset-0 z-10" 
                        value={primaryColor}
                        onChange={(e) => updateToken("primaryColor", e.target.value)}
                      />
                      <div 
                        className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center transition-transform active:scale-90"
                        style={{ backgroundColor: primaryColor }}
                      >
                        <div className="w-1 h-1 rounded-full bg-black/50" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-spotify-near-black p-5 rounded-xl border border-white/5">
            <p className="text-[13px] text-spotify-silver font-medium leading-relaxed">
              버튼, 링크, 프로필 강조 등 사이트 전체의 <strong className="text-white">핵심 브랜드 컬러</strong>를 변경합니다. 테마 프리셋의 기본 색상보다 우선 적용됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Typography & Details */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
        {/* Typography */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 rounded-full">
               <Type className="w-4 h-4 text-spotify-silver" />
             </div>
             <h4 className="text-[16px] font-bold text-white">폰트 스타일</h4>
          </div>
          <Select 
            value={designTokens?.fontFamily || "inter"} 
            onValueChange={(v) => updateToken("fontFamily", v)}
          >
            <SelectTrigger className="h-14 rounded-full border-none bg-spotify-dark-surface shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark transition-colors px-6">
              <SelectValue placeholder="폰트 선택" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-mid-dark border-none rounded-2xl shadow-spotify p-2 text-white">
              {fontOptions.map((f) => (
                <SelectItem key={f.id} value={f.id} className="py-3 rounded-xl focus:bg-white/10 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{f.name}</span>
                    <span className="text-[11px] text-spotify-silver font-medium">{f.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Spacing */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 rounded-full">
               <ArrowUpDown className="w-4 h-4 text-spotify-silver" />
             </div>
             <h4 className="text-[16px] font-bold text-white">섹션 여백</h4>
          </div>
          <Select 
            value={designTokens?.spacing || "normal"} 
            onValueChange={(v) => updateToken("spacing", v)}
          >
            <SelectTrigger className="h-14 rounded-full border-none bg-spotify-dark-surface shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark transition-colors px-6">
              <SelectValue placeholder="여백 선택" />
            </SelectTrigger>
            <SelectContent className="bg-spotify-mid-dark border-none rounded-2xl shadow-spotify p-2 text-white">
              {spacingOptions.map((s) => (
                <SelectItem key={s.id} value={s.id} className="py-3 rounded-xl focus:bg-white/10 cursor-pointer">
                  <div className="flex flex-col">
                    <span className="font-bold text-white">{s.name}</span>
                    <span className="text-[11px] text-spotify-silver font-medium">{s.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Border Radius */}
        <div className="space-y-4 col-span-full">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-white/5 rounded-full">
               <Square className="w-4 h-4 text-spotify-silver" />
             </div>
             <h4 className="text-[16px] font-bold text-white">라운드처리</h4>
          </div>
          <div className="grid grid-cols-5 gap-3 bg-spotify-near-black p-3 rounded-[32px] shadow-inner border border-white/5">
            {radiusOptions.map((r) => (
              <button
                key={r.id}
                onClick={() => updateToken("borderRadius", r.id)}
                className={cn(
                  "flex flex-col items-center justify-center py-5 rounded-2xl transition-all",
                  (designTokens?.borderRadius || "md") === r.id 
                    ? "bg-spotify-mid-dark text-spotify-green shadow-spotify-md font-bold scale-[1.05]" 
                    : "text-spotify-silver hover:text-white hover:bg-white/5 font-medium"
                )}
              >
                <div 
                  className={cn(
                    "w-7 h-7 border-2 mb-3 transition-all",
                    (designTokens?.borderRadius || "md") === r.id ? "border-spotify-green shadow-[0_0_8px_rgba(30,215,96,0.3)]" : "border-spotify-silver/30"
                  )}
                  style={{ borderRadius: r.id === 'none' ? '0px' : r.id === 'sm' ? '4px' : r.id === 'md' ? '8px' : r.id === 'lg' ? '12px' : '99px' }}
                />
                <span className="text-[12px] uppercase tracking-spotify">{r.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Advanced Custom CSS */}
      <section className="space-y-6 pt-10 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-white/5 rounded-full">
            <Code className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[20px] font-bold text-white tracking-tight">
              고급 CSS 편집
            </h3>
            <p className="text-[12px] text-spotify-silver font-bold italic tracking-spotify">CODE EDITOR</p>
          </div>
        </div>

        <div className="bg-[#1e1e1e] p-8 rounded-[32px] shadow-spotify space-y-5 border border-white/5">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="flex gap-1.5">
                 <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.3)]" />
                 <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.3)]" />
                 <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.3)]" />
               </div>
               <span className="ml-3 text-[12px] font-mono text-spotify-silver uppercase tracking-spotify-wide opacity-50">custom-styles.css</span>
             </div>
          </div>
          
          <div className="relative">
            <textarea
              value={designTokens?.customCss || ""}
              onChange={(e) => updateToken("customCss", e.target.value)}
              placeholder="/* 이곳에 커스텀 CSS를 입력하세요 */&#10;.portfolio-header { background: linear-gradient(...) }"
              className="w-full h-56 bg-transparent text-[#d4d4d4] font-mono text-[14px] leading-relaxed resize-none focus:outline-none placeholder:text-gray-700 custom-scrollbar"
              spellCheck={false}
            />
          </div>
          
          <div className="pt-5 border-t border-white/5 flex items-center justify-between">
             <p className="text-[11px] text-spotify-silver font-medium">
               <span className="text-spotify-green mr-1.5">TIP:</span> 
               CSS 셀렉터로 테마를 정밀하게 튜닝할 수 있습니다.
             </p>
             <span className="text-[10px] text-white/20 font-mono italic">v2.0 Immersive</span>
          </div>
        </div>
      </section>
    </div>
  );
}
