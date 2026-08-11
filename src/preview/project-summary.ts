export interface ParsedProjectSummary {
  headline: string | null;
  highlights: string[];
  demo_url: string | null;
  role: string | null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function safeHttpUrl(value: unknown): string | null {
  const url = text(value);
  if (!url) return null;

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

export function parseProjectSummary(
  summary: string | null | undefined,
): ParsedProjectSummary {
  const fallback = text(summary);
  if (!fallback) {
    return { headline: null, highlights: [], demo_url: null, role: null };
  }

  if (!fallback.startsWith("{")) {
    return { headline: fallback, highlights: [], demo_url: null, role: null };
  }

  try {
    const data = JSON.parse(fallback) as unknown;
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error();
    const record = data as Record<string, unknown>;

    return {
      headline: text(record.headline),
      highlights: Array.isArray(record.highlights)
        ? record.highlights
            .map(text)
            .filter((item): item is string => Boolean(item))
        : [],
      demo_url: safeHttpUrl(record.demo_url),
      role: text(record.role),
    };
  } catch {
    return { headline: fallback, highlights: [], demo_url: null, role: null };
  }
}
