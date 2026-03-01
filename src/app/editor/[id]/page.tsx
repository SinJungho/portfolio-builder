"use client";

import { Canvas } from "@/components/features/editor/Canvas";
import { LeftSidebar } from "@/components/layouts/LeftSidebar";
import { RightPanel } from "@/components/layouts/RightPanel";
import { TopToolbar } from "@/components/layouts/TopToolbar";
import { useState } from "react";


export default function Page() {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <TopToolbar />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />
        <Canvas
          selectedBlock={selectedBlock}
          onSelectBlock={setSelectedBlock}
        />
        <RightPanel selectedBlock={selectedBlock} />
      </div>
    </div>
  );
}
