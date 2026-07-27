export type PortfolioState = "draft" | "preview" | "published";

export function getPortfolioState(
  isPublished: boolean,
  blockCount: number,
): PortfolioState {
  if (isPublished) return "published";
  return blockCount > 0 ? "preview" : "draft";
}

export const portfolioStateLabel: Record<PortfolioState, string> = {
  draft: "초안",
  preview: "공개 준비됨",
  published: "공개됨",
};
