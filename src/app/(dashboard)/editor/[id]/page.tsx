import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditorClient from "./EditorClient";
import { type Block } from "@/stores/portfolioStore";
import { portfolioUrl } from "@/lib/portfolio-url";

export default async function EditorPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

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

  const initialData = {
    portfolioId: portfolio.id,
    slug: portfolio.slug,
    customDomain: portfolio.custom_domain,
    blocks: blocks as unknown as Block[],
    theme: portfolio.theme,
    isPublished: portfolio.is_published,
    publishedUrl: portfolio.slug
      ? portfolioUrl(portfolio.slug, portfolio.custom_domain)
      : null,
  };

  return <EditorClient initialData={initialData} />;
}
