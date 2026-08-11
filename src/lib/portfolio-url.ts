const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const isLocal = APP_URL.includes("localhost") || APP_URL.includes("127.0.0.1");

export function normalizePortfolioSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

/**
 * 게시된 포트폴리오의 정식 공개 URL.
 * 화면 표시·클립보드 복사·새 탭 열기가 모두 이 값을 써서 "보여준 주소 = 건넨 주소"를 보장한다.
 * 커스텀 도메인이 설정돼 있으면 그것이 정식 주소 — 없으면 프로덕션은 서브도메인, 로컬은 경로 방식.
 */
export function portfolioUrl(slug: string, customDomain?: string | null): string {
  if (customDomain) return `https://${customDomain}`;
  return isLocal
    ? `${APP_URL.replace(/\/$/, "")}/${slug}`
    : `https://${slug}.portfolioforge.app`;
}

/** 화면 표기용(프로토콜 제거). portfolioUrl과 항상 동일한 주소를 가리킨다. */
export function portfolioUrlLabel(
  slug: string,
  customDomain?: string | null,
): string {
  return portfolioUrl(slug, customDomain).replace(/^https?:\/\//, "");
}
