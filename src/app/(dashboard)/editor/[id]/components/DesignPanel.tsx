"use client";

import DesignEditor from "@/components/features/editor/DesignEditor";

function DesignPanel() {
  return (
    <div className="space-y-6">
      <div className="px-1">
        <h2 className="text-[17px] font-bold tracking-tight text-white">디자인</h2>
        <p className="mt-1 text-[12px] font-medium text-spotify-silver">추천 분위기를 고른 뒤 필요할 때만 세부 설정을 조정해요.</p>
      </div>
      <DesignEditor />
    </div>
  );
}

export default DesignPanel;

