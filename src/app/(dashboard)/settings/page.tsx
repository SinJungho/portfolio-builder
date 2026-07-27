import { IntegrationsSection } from "@/components/features/settings/IntegrationsSection";

export default function Page() {
  return (
    <div className="flex min-h-screen bg-spotify-near-black">
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <IntegrationsSection />
        </div>
      </main>
    </div>
  );
}
