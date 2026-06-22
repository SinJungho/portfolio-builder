"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { ArrowUpDown, Square, Type } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  desc: string;
}

const fontOptions: OptionItem[] = [
  { id: "inter", name: "Inter", desc: "현대적이고 기하학적인 산세리프" },
  {
    id: "pretendard",
    name: "Pretendard",
    desc: "가장 대중적인 표준 한글 서체",
  },
  { id: "fira-code", name: "Fira Code", desc: "코딩 감성의 고정폭 폰트" },
  {
    id: "playfair",
    name: "Playfair Display",
    desc: "우아하고 고전적인 세리프",
  },
];

const radiusOptions: OptionItem[] = [
  { id: "none", name: "없음", desc: "각진 모서리" },
  { id: "sm", name: "작게", desc: "약간의 곡선" },
  { id: "md", name: "보통", desc: "부드러운 표준" },
  { id: "lg", name: "크게", desc: "둥글고 현대적" },
  { id: "full", name: "완전 둥글게", desc: "완전한 캡슐" },
];

const spacingOptions: OptionItem[] = [
  { id: "compact", name: "좁게", desc: "밀도 있는 구성" },
  { id: "normal", name: "보통", desc: "여유로운 가독성" },
  { id: "relaxed", name: "넓게", desc: "고급스러운 공간감" },
];

export default function TypographyAndDetails() {
  const { designTokens, setDesignTokens } = usePortfolioStore();

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full">
            <Type className="w-4 h-4 text-spotify-silver" />
          </div>
          <h4 className="text-[16px] font-bold text-white">폰트 스타일</h4>
        </div>
        <Select
          value={(designTokens?.fontFamily as string) || "inter"}
          onValueChange={(value: string) => updateToken("fontFamily", value)}
        >
          <SelectTrigger className="h-14 rounded-full border-none bg-spotify-dark-surface shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark transition-colors px-6">
            <SelectValue placeholder="폰트 선택" />
          </SelectTrigger>
          <SelectContent className="bg-spotify-mid-dark border-none rounded-2xl shadow-spotify p-2 text-white">
            {fontOptions.map((font: OptionItem) => (
              <SelectItem
                key={font.id}
                value={font.id}
                className="py-3 rounded-xl focus:bg-white/10 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white">{font.name}</span>
                  <span className="text-[11px] text-spotify-silver font-medium">
                    {font.desc}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full">
            <ArrowUpDown className="w-4 h-4 text-spotify-silver" />
          </div>
          <h4 className="text-[16px] font-bold text-white">섹션 여백</h4>
        </div>
        <Select
          value={(designTokens?.spacing as string) || "normal"}
          onValueChange={(value: string) => updateToken("spacing", value)}
        >
          <SelectTrigger className="h-14 rounded-full border-none bg-spotify-dark-surface shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark transition-colors px-6">
            <SelectValue placeholder="여백 선택" />
          </SelectTrigger>
          <SelectContent className="bg-spotify-mid-dark border-none rounded-2xl shadow-spotify p-2 text-white">
            {spacingOptions.map((spacing: OptionItem) => (
              <SelectItem
                key={spacing.id}
                value={spacing.id}
                className="py-3 rounded-xl focus:bg-white/10 cursor-pointer"
              >
                <div className="flex flex-col">
                  <span className="font-bold text-white">{spacing.name}</span>
                  <span className="text-[11px] text-spotify-silver font-medium">
                    {spacing.desc}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4 col-span-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full">
            <Square className="w-4 h-4 text-spotify-silver" />
          </div>
          <h4 className="text-[16px] font-bold text-white">라운드처리</h4>
        </div>
        <div className="grid grid-cols-5 gap-3 bg-spotify-near-black p-3 rounded-[32px] shadow-inner border border-white/5">
          {radiusOptions.map((radius: OptionItem) => (
            <button
              key={radius.id}
              onClick={() => updateToken("borderRadius", radius.id)}
              className={cn(
                "flex flex-col items-center justify-center py-5 rounded-2xl transition-all",
                ((designTokens?.borderRadius as string) || "md") === radius.id
                  ? "bg-spotify-mid-dark text-spotify-green shadow-spotify-md font-bold scale-[1.05]"
                  : "text-spotify-silver hover:text-white hover:bg-white/5 font-medium",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 border-2 mb-3 transition-all",
                  ((designTokens?.borderRadius as string) || "md") === radius.id
                    ? "border-spotify-green shadow-[0_0_8px_rgba(30,215,96,0.3)]"
                    : "border-spotify-silver/30",
                )}
                style={{
                  borderRadius:
                    radius.id === "none"
                      ? "0px"
                      : radius.id === "sm"
                        ? "4px"
                        : radius.id === "md"
                          ? "8px"
                          : radius.id === "lg"
                            ? "12px"
                            : "99px",
                }}
              />
              <span className="text-[12px] uppercase tracking-spotify">
                {radius.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
