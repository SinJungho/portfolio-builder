import { Check, ExternalLink, Globe2, Lock, Link2, Rocket, Zap } from "lucide-react";

// 제3자 호스팅(Vercel/Netlify)이 아니라, PortfolioForge가 직접 내 주소로 호스팅한다.
const perks = [
  { name: "HTTPS 자동", Icon: Lock },
  { name: "커스텀 도메인", Icon: Globe2 },
  { name: "링크로 공유", Icon: Link2 },
];

export default function StepVisualDeploy() {
  return (
    <div className="w-full p-4 sm:p-7">
      <div className="relative mx-auto max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c1110] shadow-[0_20px_48px_rgba(0,0,0,0.38)]">
        <div aria-hidden="true" className="absolute -right-12 -top-16 h-44 w-44 rounded-full bg-spotify-green/15 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-20 -left-10 h-36 w-36 rounded-full bg-[#539df5]/10 blur-3xl" />

        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-spotify-green text-black">
              <Rocket size={13} strokeWidth={2.8} aria-hidden="true" />
            </span>
            <span className="text-[12px] font-bold text-white">배포 센터</span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-spotify-green/20 bg-spotify-green/10 px-2 py-1 text-[9px] font-bold tracking-[0.08em] text-spotify-green">
            <span className="h-1.5 w-1.5 rounded-full bg-spotify-green shadow-[0_0_8px_rgba(30,215,96,1)]" />
            LIVE
          </span>
        </div>

        <div className="relative p-4 sm:p-5">
          <p className="mb-2 text-[10px] font-bold tracking-[0.1em] text-spotify-silver">YOUR PORTFOLIO IS ONLINE</p>
          <div className="group flex items-center gap-3 rounded-xl border border-spotify-green/30 bg-spotify-green/[0.07] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)]">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-spotify-green text-black shadow-[0_0_18px_rgba(30,215,96,0.25)]">
              <Globe2 size={18} strokeWidth={2.4} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-white">jaemin-dev.portfolioforge.app</p>
              <p className="mt-0.5 text-[10px] font-medium text-spotify-silver">나만의 주소로 공개되었습니다</p>
            </div>
            <ExternalLink size={15} className="shrink-0 text-spotify-green transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
          </div>

          <div className="relative my-4 flex items-center gap-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full border border-spotify-green/50 bg-[#0c1110]" />
            <span className="h-px flex-1 bg-gradient-to-r from-spotify-green/60 via-spotify-green/20 to-transparent" />
            <Zap size={13} className="text-spotify-green" fill="currentColor" />
            <span className="h-px flex-1 bg-gradient-to-l from-[#539df5]/50 via-white/10 to-transparent" />
            <span className="h-2 w-2 rounded-full border border-[#539df5]/50 bg-[#0c1110]" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {perks.map((perk) => (
              <div key={perk.name} className="flex flex-col items-center gap-1.5 rounded-lg border border-white/8 bg-white/[0.035] px-2 py-2.5 text-center">
                <perk.Icon size={13} className="text-spotify-green" aria-hidden="true" />
                <span className="block truncate text-[9px] font-semibold text-spotify-near-white">{perk.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center justify-between border-t border-white/10 bg-black/15 px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-spotify-silver">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-spotify-green text-black"><Check size={10} strokeWidth={4} aria-hidden="true" /></span>
            전 세계에서 접속 가능
          </span>
          <span className="text-[10px] font-bold text-spotify-green">공유할 준비 완료</span>
        </div>
      </div>
    </div>
  );
}
