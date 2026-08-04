export interface RawProject {
  id: string;
  name: string;
  description: string | null;
  html_url?: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string | null;
  ai_summary?: string | null;
  ai_tags?: string[];
  is_featured?: boolean;
}

export interface AISummary {
  headline?: string;
  highlights?: string[];
  demo_url?: string | null;
  role?: string | null;
}
