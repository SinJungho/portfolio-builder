import { Check, LayoutTemplate, Palette, Type } from "lucide-react";

const colorSwatches = [
  { name: "Lime", color: "#1ed760", selected: true },
  { name: "Sky", color: "#539df5" },
  { name: "Violet", color: "#a78bfa" },
  { name: "Coral", color: "#fb7185" },
];

export default function StepVisualCustomize() {
  return (
    <div className="w-full p-4 sm:p-7">
      <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#101010] shadow-[0_20px_45px_rgba(0,0,0,0.38)]">
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.025] px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-spotify-green text-black">
              <Palette size={13} strokeWidth={2.7} aria-hidden="true" />
            </span>
            <span className="text-[12px] font-bold text-white">스타일 편집</span>
            <span className="hidden text-[10px] font-medium text-spotify-silver sm:inline">내 포트폴리오</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-spotify-green/20 bg-spotify-green/10 px-2 py-1 text-[9px] font-bold tracking-[0.06em] text-spotify-green">
            <span className="h-1.5 w-1.5 rounded-full bg-spotify-green shadow-[0_0_7px_rgba(30,215,96,0.9)]" />
            LIVE
          </span>
        </div>

        <div className="grid min-h-[216px] grid-cols-[minmax(7.25rem,0.88fr)_minmax(0,1.12fr)]">
          <div className="border-r border-white/10 p-3 sm:p-4">
            <div className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.04em] text-white">
              <Palette size={13} className="text-spotify-green" aria-hidden="true" />
              ACCENT COLOR
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              {colorSwatches.map((swatch) => (
                <div
                  key={swatch.name}
                  className={`relative flex min-w-0 items-center gap-1 rounded-lg border p-1 ${
                    swatch.selected
                      ? "border-spotify-green/60 bg-spotify-green/10"
                      : "border-white/8 bg-white/[0.025]"
                  }`}
                >
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ backgroundColor: swatch.color }} />
                  <span className="truncate text-[9px] font-semibold text-spotify-near-white">{swatch.name}</span>
                  {swatch.selected && (
                    <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-spotify-green text-black">
                      <Check size={9} strokeWidth={4} aria-hidden="true" />
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="my-4 h-px bg-white/8" />

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-white">
                <span className="flex items-center gap-1.5"><Type size={12} className="text-spotify-silver" aria-hidden="true" /> 타이포그래피</span>
                <span className="rounded bg-white/8 px-1.5 py-0.5 text-[8px] text-spotify-silver">Mono</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-white">
                <span className="flex items-center gap-1.5"><LayoutTemplate size={12} className="text-spotify-silver" aria-hidden="true" /> 레이아웃</span>
                <span className="text-[9px] text-spotify-green">Stacked</span>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#171717] p-3 sm:p-4">
            <div aria-hidden="true" className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-spotify-green/15 blur-2xl" />
            <div className="relative mb-3 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.04em] text-spotify-silver">PREVIEW</span>
              <span className="h-1.5 w-1.5 rounded-full bg-spotify-green" />
            </div>

            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0d0d0d] p-3 shadow-[0_12px_20px_rgba(0,0,0,0.28)]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[8px] font-bold tracking-[0.12em] text-white">J. KIM</span>
                <div className="flex gap-1"><span className="h-1 w-1 rounded-full bg-spotify-green" /><span className="h-1 w-1 rounded-full bg-white/20" /></div>
              </div>
              <div className="mb-2 h-11 rounded-lg bg-[linear-gradient(120deg,#1ed760_0%,#1ed760_38%,#b7f93a_100%)] p-2">
                <div className="h-1.5 w-12 rounded-full bg-black/70" />
                <div className="mt-1.5 h-1 w-20 rounded-full bg-black/30" />
              </div>
              <div className="mb-1.5 h-1.5 w-3/4 rounded-full bg-white/85" />
              <div className="mb-3 h-1 w-1/2 rounded-full bg-white/20" />
              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-8 rounded-md border border-white/10 bg-white/[0.04]" />
                <div className="h-8 rounded-md border border-spotify-green/50 bg-spotify-green/15" />
              </div>
            </div>
            <p className="relative mt-2.5 text-[9px] font-medium leading-relaxed text-spotify-silver">
              고른 스타일이 미리보기에 바로 반영돼요.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[10px]">
          <span className="font-medium text-spotify-silver">변경사항 저장됨</span>
          <span className="font-bold text-spotify-green">내 스타일로 완성하기 →</span>
        </div>
      </div>
    </div>
  );
}
