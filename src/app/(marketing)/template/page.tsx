import { CTASection } from "@/components/features/marketing/CTASection";
import { Footer } from "@/components/layouts/Footer";
import { Header } from "@/components/layouts/Header";
import { PageHeader } from "@/components/layouts/PageHeader";
import { TemplateGrid } from "@/components/features/templates/TemplateGrid";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="pt-[72px]">
        <PageHeader />
        <TemplateGrid />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
