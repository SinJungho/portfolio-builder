import Footer from "@/components/layouts/Footer";
import Header from "@/components/layouts/Header";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-spotify-near-black min-h-screen">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
