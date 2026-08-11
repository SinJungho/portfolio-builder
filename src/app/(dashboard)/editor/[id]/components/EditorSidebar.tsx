"use client";

import { Loader2 } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";

export type SidebarTab = "blocks" | "publish" | "design";

interface EditorSidebarProps {
  isPreviewing: boolean;
  isInspectorOpen: boolean;
  sidebarTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onTabKeyDown: (
    event: KeyboardEvent<HTMLButtonElement>,
    tab: SidebarTab,
  ) => void;
  isPending: boolean;
  children: ReactNode;
}

export default function EditorSidebar({
  isPreviewing,
  isInspectorOpen,
  sidebarTab,
  onTabChange,
  onTabKeyDown,
  isPending,
  children,
}: EditorSidebarProps) {
  const tabs: Array<{ id: SidebarTab; label: string }> = [
    { id: "publish", label: "공개 준비" },
    { id: "blocks", label: "콘텐츠 구성" },
    { id: "design", label: "디자인" },
  ];

  return (
    <aside
      className={`${isPreviewing ? "hidden" : "flex"} ${isInspectorOpen ? "lg:flex" : "lg:hidden"} w-full shrink-0 flex-col border-r border-white/5 bg-spotify-dark-surface shadow-spotify lg:static lg:max-h-none lg:w-[380px] lg:rounded-none`}
    >
      <div role="tablist" aria-label="포트폴리오 편집 단계" className="flex shrink-0 gap-2 border-b border-white/5 bg-spotify-near-black p-3">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            id={`editor-tab-${id}`}
            onClick={() => onTabChange(id)}
              onKeyDown={(event) => onTabKeyDown(event, id)}
            className={`flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-full py-2.5 text-[13px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${sidebarTab === id ? "bg-white text-black shadow-spotify-md" : "bg-spotify-mid-dark text-white hover:bg-spotify-dark-surface"}`}
            type="button"
            role="tab"
            aria-selected={sidebarTab === id}
            aria-controls="editor-panel"
            tabIndex={sidebarTab === id ? 0 : -1}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id="editor-panel" aria-labelledby={`editor-tab-${sidebarTab}`} className="flex-1 overflow-y-auto overscroll-contain bg-spotify-dark-surface p-5 lg:p-6">
        {isPending ? (
          <div className="flex justify-center py-20" role="status" aria-live="polite">
            <Loader2 className="h-6 w-6 animate-spin text-spotify-green" aria-hidden="true" />
            <span className="sr-only">편집 패널을 불러오는 중</span>
          </div>
        ) : children}
      </div>
    </aside>
  );
}
