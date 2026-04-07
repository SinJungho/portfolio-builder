import { Block } from "@/stores/portfolioStore";

export type GenerateJobResponse = {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  blocks?: Block[];
  published_url?: string | null;
  missing_optional_fields?: string[];
  error?: string;
};
