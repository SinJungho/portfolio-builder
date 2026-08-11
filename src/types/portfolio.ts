import { type Block } from "@/stores/portfolioStore";

export interface PortfolioInitialData {
  portfolioId: string;
  slug: string | null;
  customDomain: string | null;
  blocks: Block[];
  theme: string;
  designTokens?: Record<string, unknown>;
  isPublished: boolean;
  publishedUrl: string | null;
}

export interface PublishedSnapshot {
  theme: string;
  designTokens: Record<string, unknown>;
  blocks: Block[];
  savedAt: string;
}
