import { CTASection } from "@/components/a";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHeader } from "@/components/PageHeader";
import { TemplateGrid } from "@/components/TemplateGrid";

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
