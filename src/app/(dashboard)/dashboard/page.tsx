import { PortfolioGrid } from "@/components/features/dashboard/PortfolioGrid";
import { StatsCards } from "@/components/features/dashboard/StatsCards";
import { Sidebar } from "@/components/layouts/Sidebar";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <Sidebar />

      <main className="flex-1 flex flex-col ml-64 transition-all duration-300">
        <div className="p-10 max-w-[1200px] mx-auto w-full space-y-12">
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <StatsCards />
          </section>

          <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <PortfolioGrid />
          </section>
        </div>
      </main>
    </div>
  );
}
