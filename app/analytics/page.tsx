import { AnalyticsHeader } from "@/components/AnalyticsHeader";
import { BreakdownGrid } from "@/components/BreakdownGrid";
import { ChartSection } from "@/components/ChartSection";
import { MetricsGrid } from "@/components/MetricsGrid";
import { Sidebar } from "@/components/Sidebar";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 ml-[240px]">
        <AnalyticsHeader />

        <div className="p-8 max-w-[1200px]">
          <MetricsGrid />
          <ChartSection />
          <BreakdownGrid />
        </div>
      </main>
    </div>
  );
}
