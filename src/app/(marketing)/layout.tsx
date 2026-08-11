import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-spotify-near-black font-[system-ui,sans-serif]">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
