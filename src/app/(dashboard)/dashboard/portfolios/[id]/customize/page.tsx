import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ThemeCustomizer from "@/components/dashboard/ThemeCustomizer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PortfolioCustomizePage({ params }: Props) {
  const { id } = await params;

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
  });

  if (!portfolio) {
    notFound();
  }

  const blocks = await prisma.portfolioBlock.findMany({
    where: { portfolio_id: id },
    orderBy: { position: "asc" },
  });

  return (
    <div className="flex flex-col h-screen bg-[#F9FAFB] overflow-hidden">
      {/* Top Navigation */}
      <header className="h-16 px-6 border-b border-black/5 bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-[#191F28]"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-[1px] bg-gray-200" />
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-[#3182F6] rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="font-bold text-[16px] text-[#191F28]">
              {portfolio.title || portfolio.slug} 디자인 수정
            </h1>
          </div>
        </div>
      </header>

      {/* Main Customizer UI */}
      <main className="flex-1 overflow-hidden">
        <ThemeCustomizer portfolio={portfolio} initialBlocks={blocks} />
      </main>
    </div>
  );
}
