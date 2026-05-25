import { DashboardHeader } from "@/components/layouts/DashboardHeader";
import { ReactNode } from "react";

export default function GenerateLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-spotify-near-black text-white flex flex-col">
      <DashboardHeader />
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
