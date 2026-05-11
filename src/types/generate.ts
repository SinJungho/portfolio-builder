export type GenerateJobResponse = {
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks?: any[];
  published_url?: string | null;
  missing_optional_fields?: string[];
  error?: string;
};
