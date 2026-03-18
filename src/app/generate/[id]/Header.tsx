"use client";

import { useSearchParams } from "next/navigation";

export function GenerateHeader() {
  const searchParams = useSearchParams();
  const step = searchParams.get("step") || "connect";

  let title = "1 / 3";
  if (step === "analyze") title = "2 / 3";
  else if (step === "generate") title = "3 / 3";
  else if (step === "adjust") title = "미세 조정";

  return (
    <header className="flex h-16 items-center justify-between border-b px-6">
      <div className="font-bold text-xl tracking-tight">PortfolioForge</div>
      <div className="text-sm font-medium text-muted-foreground">{title}</div>
    </header>
  );
}
