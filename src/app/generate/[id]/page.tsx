import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdjustStep from "./steps/adjust";
import AnalyzeStep from "./steps/analyze";
import ConfigureStep from "./steps/configure";
import ConnectStep from "./steps/connect";
import GenerateStep from "./steps/generate";

export default async function GeneratePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    step?: string;
    sync_job_id?: string;
    generate_job_id?: string;
  }>;
}) {
  const { id } = await props.params;
  const { step, sync_job_id, generate_job_id } = await props.searchParams;

  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
  });

  if (!portfolio) {
    notFound();
  }

  switch (step) {
    case "adjust": {
      const blocks = await prisma.portfolioBlock.findMany({
        where: { portfolio_id: id },
        orderBy: { position: "asc" },
      });

      const initialData = {
        portfolioId: portfolio.id,
        blocks: blocks.map((b) => ({
          id: b.id,
          block_type: b.block_type,
          position: b.position,
          config: (b.config as Record<string, unknown>) || {},
          is_visible: b.is_visible,
          is_ai_generated: b.is_ai_generated,
        })),
        theme: portfolio.theme,
        isPublished: portfolio.is_published,
        publishedUrl: portfolio.slug
          ? `/${portfolio.slug}`
          : null,
      };
      return <AdjustStep portfolioId={id} initialData={initialData} />;
    }
    case "analyze":
      return <AnalyzeStep portfolioId={id} syncJobId={sync_job_id} />;
    case "configure":
      return <ConfigureStep portfolioId={id} />;
    case "generate":
      return <GenerateStep portfolioId={id} generateJobId={generate_job_id} />;
    default:
      return <ConnectStep portfolioId={id} />;
  }
}
