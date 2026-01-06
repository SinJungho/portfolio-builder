import { SettingsContent } from "@/components/SettingsContent";
import { SettingsNav } from "@/components/SettingsNav";
import { Sidebar } from "@/components/Sidebar";
import { useState } from "react";

export default function Page() {
  const [activeSection, setActiveSection] = useState<
    "profile" | "account" | "integrations" | "billing" | "danger"
  >("profile");

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-[240px]">
        <div className="border-b border-gray-200 bg-white px-8 py-6">
          <h1 className="text-gray-900">Settings</h1>
        </div>

        <div className="flex">
          <SettingsNav
            activeSection={activeSection}
            onSectionChange={setActiveSection}
          />
          <SettingsContent activeSection={activeSection} />
        </div>
      </main>
    </div>
  );
}
