export interface Integration {
  id: string;
  user_id: string;
  provider: string;
  metadata: {
    feedUrl?: string;
    [key: string]: unknown;
  } | null;
  synced_at: string | null;
  is_active: boolean;
  created_at: string;
}
