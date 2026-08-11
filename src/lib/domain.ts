const RESERVED_HOSTS = ["portfolioforge.app", "vercel.app"];

export function normalizeCustomDomain(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
    if (
      url.username ||
      url.password ||
      url.port ||
      hostname === "localhost" ||
      !hostname.includes(".") ||
      /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) ||
      RESERVED_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`)) ||
      !/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(hostname)
    ) {
      return null;
    }
    return hostname;
  } catch {
    return null;
  }
}
