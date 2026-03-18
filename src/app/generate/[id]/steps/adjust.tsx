"use client";

import { useEffect } from "react";
import { usePortfolioStore } from "@/stores/portfolioStore";
import { Loader2 } from "lucide-react";

export default function AdjustStep({ portfolioId }: { portfolioId: string }) {
  const { blocks, theme, isSaving } = usePortfolioStore();

  useEffect(() => {
    // In production, we'd fetch the initial portfolio and blocks data here
    // and call `initialize` with the fetched data if not already set.
    // For now, this acts as a placeholder or you can implement the GET fetch.
  }, [portfolioId]);

  return (
    <div className="flex flex-col flex-1 w-full max-w-2xl mt-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">포트폴리오 미세 조정</h2>
        {isSaving && <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />}
      </div>

      <div className="bg-card p-6 border rounded-xl shadow-sm text-center text-muted-foreground">
        <p>미세 조정 기능(블록 순서 변경, 토글 등) UI가 여기에 렌더링 됩니다.</p>
        <p className="mt-2 text-sm">
          현재는 {blocks.length}개의 블록과 '{theme}' 테마가 설정되어 있습니다.
          변경사항은 즉시 반영됩니다.
        </p>
        <div className="mt-8">
          {/* Dashboard Button */}
          <a
            href="/dashboard"
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            대시보드로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
