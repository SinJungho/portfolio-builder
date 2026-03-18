import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ConnectStep from "./steps/connect";
import AnalyzeStep from "./steps/analyze";
import GenerateStep from "./steps/generate";
import AdjustStep from "./steps/adjust";

export default async function GeneratePage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string; sync_job_id?: string; generate_job_id?: string }>;
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
    return <AdjustStep portfolioId={id} />;
  }

  if (step === "analyze") {
    return <AnalyzeStep portfolioId={id} syncJobId={sync_job_id} />;
  }

  if (step === "generate") {
    return <GenerateStep portfolioId={id} generateJobId={generate_job_id} />;
  }

  return <ConnectStep portfolioId={id} />;
}
