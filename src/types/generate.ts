export type GenerateJobResponse = {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  blocks?: any[];
  published_url?: string | null;
  missing_optional_fields?: string[];
  error?: string;
};
