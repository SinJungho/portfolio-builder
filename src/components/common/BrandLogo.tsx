import { Sparkles } from "lucide-react";

export default function BrandLogo() {
  return (
    <>
      <span
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-spotify-green text-black shadow-[0_4px_12px_rgba(30,215,96,0.3)]"
      >
        <Sparkles className="h-5 w-5 stroke-[2.5px]" />
      </span>
      <span className="text-[20px] font-bold tracking-tight text-white">
        PortfolioForge
      </span>
    </>
  );
}
