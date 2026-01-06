import { DashboardHeader } from "@/components/DashboardHeader";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/components/StatsCards";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-60">
        <DashboardHeader />

        <div className="p-8 max-w-300">
          <StatsCards />
          <PortfolioGrid />
        </div>
      </main>
    </div>
  );
}
