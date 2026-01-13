import { AnalyticsHeader } from "@/components/layouts/AnalyticsHeader";
import { BreakdownGrid } from "@/components/features/analytics/BreakdownGrid";
import { ChartSection } from "@/components/features/analytics/ChartSection";
import { MetricsGrid } from "@/components/features/analytics/MetricsGrid";
import { Sidebar } from "@/components/layouts/Sidebar";

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
