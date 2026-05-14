"use client";

import { SettingsContent } from "@/components/features/settings/SettingsContent";
import { SettingsNav } from "@/components/features/settings/SettingsNav";
import { useState } from "react";

export default function Page() {
  const [activeSection, setActiveSection] = useState<
    "profile" | "account" | "integrations" | "danger"
  >("profile");

  return (
    <div className="flex min-h-screen bg-spotify-near-black">
      <main className="flex-1">
        <div className="border-b border-white/5 bg-spotify-near-black/50 backdrop-blur-md sticky top-0 z-10 px-8 py-6">
          <h1 className="text-2xl font-black text-white tracking-tight">Settings</h1>
        </div>

        <div className="flex flex-col lg:flex-row max-w-6xl mx-auto px-4 py-8 gap-8">
          <SettingsNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <div className="flex-1">
            <SettingsContent activeSection={activeSection} />
          </div>
        </div>
      </main>
    </div>
  );
}
