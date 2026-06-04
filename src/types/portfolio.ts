import { type Block } from "@/stores/portfolioStore";

export interface PortfolioInitialData {
  portfolioId: string;
  slug: string | null;
  customDomain: string | null;
  blocks: Block[];
  theme: string;
  isPublished: boolean;
  publishedUrl: string | null;
}
