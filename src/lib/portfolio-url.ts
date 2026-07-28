const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const isLocal = APP_URL.includes("localhost") || APP_URL.includes("127.0.0.1");

/**
 * 게시된 포트폴리오의 정식 공개 URL.
 * 화면 표시·클립보드 복사·새 탭 열기가 모두 이 값을 써서 "보여준 주소 = 건넨 주소"를 보장한다.
 * 프로덕션은 서브도메인, 로컬은 경로 방식 — generatePortfolio.ts의 규칙과 동일하게 맞춘다.
 */
export function portfolioUrl(slug: string): string {
  return isLocal
    ? `${APP_URL.replace(/\/$/, "")}/${slug}`
    : `https://${slug}.portfolioforge.app`;
}

/** 화면 표기용(프로토콜 제거). portfolioUrl과 항상 동일한 주소를 가리킨다. */
export function portfolioUrlLabel(slug: string): string {
  return portfolioUrl(slug).replace(/^https?:\/\//, "");
}
