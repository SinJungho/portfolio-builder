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
import { getDesignChoiceLabel } from "@/preview/themes";
import { FONT_STACK } from "@/preview/fonts";
import { ArrowUpDown, Square, Type } from "lucide-react";

interface OptionItem {
  id: string;
  name: string;
  desc: string;
}

const fontOptions: OptionItem[] = [
  { id: "inter", name: "깔끔하고 현대적인 인상", desc: "Inter · 영문과 숫자가 선명해요" },
  {
    id: "pretendard",
    name: "한글을 가장 편하게 읽기",
    desc: "Pretendard · 한국어 기본 추천",
  },
  { id: "fira-code", name: "기술적인 인상", desc: "Fira Code · 코드와 숫자를 강조해요" },
  {
    id: "playfair",
    name: "제목을 우아하게 강조하기",
    desc: "Playfair Display · 제목에만 적용돼요",
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
  { id: "compact", name: "한 화면에 더 많이 보기", desc: "프로젝트를 빠르게 훑어요" },
  { id: "normal", name: "균형 있게 읽기", desc: "정보량과 가독성의 균형" },
  { id: "relaxed", name: "여유 있게 집중하기", desc: "작업 하나씩 또렷하게 보여줘요" },
];

export default function TypographyAndDetails() {
  const { designTokens, setDesignTokens } = usePortfolioStore();
  const selectedFont = (designTokens?.fontFamily as string) || "pretendard";
  const selectedSpacing = (designTokens?.spacing as string) || "normal";
  const selectedRadius = (designTokens?.borderRadius as string) || "md";

  const updateToken = (key: string, value: string) => {
    setDesignTokens({ [key]: value });
  };

  return (
    <section className="grid grid-cols-1 gap-8 pt-4" aria-label="포트폴리오 읽는 방식">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/5 rounded-full">
            <Type className="w-4 h-4 text-spotify-silver" />
          </div>
          <h4 className="text-[16px] font-bold text-white">읽기 편한 글꼴</h4>
        </div>
        <Select
          value={selectedFont}
          onValueChange={(value: string) => updateToken("fontFamily", value)}
        >
          <SelectTrigger className="h-14 rounded-full border-none bg-spotify-dark-surface shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark transition-colors px-6">
          <SelectValue placeholder="읽는 인상 선택" />
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
          <h4 className="text-[16px] font-bold text-white">정보 밀도</h4>
        </div>
        <Select
          value={selectedSpacing}
          onValueChange={(value: string) => updateToken("spacing", value)}
        >
          <SelectTrigger className="h-14 rounded-full border-none bg-spotify-dark-surface shadow-spotify-md font-bold text-white hover:bg-spotify-mid-dark transition-colors px-6">
          <SelectValue placeholder="정보 밀도 선택" />
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
          <h4 className="text-[16px] font-bold text-white">카드 인상</h4>
        </div>
        <div className="grid grid-cols-5 gap-3 bg-spotify-near-black p-3 rounded-[32px] shadow-inner border border-white/5">
          {radiusOptions.map((radius: OptionItem) => (
            <button
              key={radius.id}
              type="button"
              aria-pressed={((designTokens?.borderRadius as string) || "md") === radius.id}
              aria-label={getDesignChoiceLabel("borderRadius", radius.id)}
              onClick={() => updateToken("borderRadius", radius.id)}
              className={cn(
                "flex flex-col items-center justify-center py-5 rounded-2xl transition-all",
                selectedRadius === radius.id
                  ? "bg-spotify-mid-dark text-spotify-green shadow-spotify-md font-bold scale-[1.05]"
                  : "text-spotify-silver hover:text-white hover:bg-white/5 font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green",
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 border-2 mb-3 transition-all",
                  selectedRadius === radius.id
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
              <span className="text-[12px]">{getDesignChoiceLabel("borderRadius", radius.id)}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-white/5 bg-spotify-near-black p-5" aria-label="읽는 방식 미리보기">
        <p className="mb-3 text-[11px] font-bold text-spotify-silver">이 설정으로 보이는 모습</p>
        <div
          className="rounded-xl bg-spotify-dark-surface p-5 text-white"
          style={{
            fontFamily: FONT_STACK[selectedFont] || FONT_STACK.pretendard,
            paddingBlock: selectedSpacing === "compact" ? "1rem" : selectedSpacing === "relaxed" ? "2.5rem" : "1.75rem",
            borderRadius: selectedRadius === "none" ? "0" : selectedRadius === "sm" ? "8px" : selectedRadius === "lg" ? "24px" : selectedRadius === "full" ? "9999px" : "16px",
          }}
        >
          <p className="text-[11px] font-bold text-spotify-green">대표 프로젝트</p>
          <p className="mt-2 text-[18px] font-bold">지원서에서 먼저 보이는 작업</p>
          <p className="mt-2 text-[12px] leading-relaxed text-spotify-silver">글꼴, 정보량, 카드 인상이 실제 포트폴리오에서 이렇게 바뀌어요.</p>
          <p className="mt-3 text-[11px] font-bold text-spotify-silver">{getDesignChoiceLabel("fontFamily", selectedFont)} · {getDesignChoiceLabel("spacing", selectedSpacing)} · {getDesignChoiceLabel("borderRadius", selectedRadius)}</p>
        </div>
      </div>
    </section>
  );
}
