import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AdjustStep from "./steps/adjust";
import AnalyzeStep from "./steps/analyze";
import ConfigureStep from "./steps/configure";
import ConnectStep from "./steps/connect";
import GenerateStep from "./steps/generate";
import { type Block } from "@/stores/portfolioStore";

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

  if (step === "adjust") {
    const blocks = await prisma.portfolioBlock.findMany({
      where: { portfolio_id: id },
      orderBy: { position: "asc" },
    });

    const initialData = {
      portfolioId: portfolio.id,
      slug: portfolio.slug,
      customDomain: portfolio.custom_domain,
      blocks: blocks as unknown as Block[],
      theme: portfolio.theme,
      isPublished: portfolio.is_published,
      publishedUrl: portfolio.slug
        ? `${process.env.NEXT_PUBLIC_APP_URL?.replace("://", `://${portfolio.slug}.`)}`
        : null,
    };
    return <AdjustStep initialData={initialData} />;
  }

  if (step === "analyze") {
    return <AnalyzeStep portfolioId={id} syncJobId={sync_job_id} />;
  }

  if (step === "configure") {
    return <ConfigureStep portfolioId={id} />;
  }

  if (step === "generate") {
    return <GenerateStep portfolioId={id} generateJobId={generate_job_id} />;
  }

  return <ConnectStep portfolioId={id} />;
}
