import { DashboardHeader } from "@/components/layouts/DashboardHeader";
import { PortfolioGrid } from "@/components/features/dashboard/PortfolioGrid";
import { Sidebar } from "@/components/layouts/Sidebar";
import { StatsCards } from "@/components/features/dashboard/StatsCards";

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
