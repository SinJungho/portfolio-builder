import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditorClient from "./EditorClient";
import { type Block } from "@/stores/portfolioStore";
import { portfolioUrl } from "@/lib/portfolio-url";
import { auth } from "@/auth";

export default async function EditorPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user?.id) notFound();

  const portfolio = await prisma.portfolio.findFirst({
    where: { id, user_id: session.user.id },
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
    designTokens: (portfolio.design_tokens || {}) as Record<string, unknown>,
    isPublished: portfolio.is_published,
    publishedUrl: portfolio.slug
      ? portfolioUrl(portfolio.slug, portfolio.custom_domain)
      : null,
  };

  return <EditorClient initialData={initialData} />;
}
