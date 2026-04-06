/**
 * 포트폴리오 서브도메인(슬러그)으로 사용할 수 없는 예약어 리스트입니다.
 * 시스템 경로와 충돌하거나 보안상 위험이 있는 키워드들을 포함합니다.
 */
export const RESERVED_SUBDOMAINS = [
  'admin',
  'api',
  'dashboard',
  'auth',
  'login',
  'logout',
  'settings',
  'setting',
  'projects',
  'project',
  'analytics',
  'generate',
  'onboarding',
  'static',
  'assets',
  'public',
  'www',
  'mail',
  'support',
  'docs',
  'blog',
  'dev',
  'test',
  'status',
  'help',
  'legal',
  'privacy',
  'terms',
] as const;

/**
 * 주어진 슬러그가 사용 가능한지 확인합니다.
 * 1. 영문 소문자, 숫자, 하이픈만 허용
 * 2. 예약어 포함 여부 확인
 */
export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.includes(subdomain.toLowerCase() as any);
}

export function isValidSlugFormat(slug: string): boolean {
  // 영문 소문자, 숫자, 하픈만 허용 (3~50자)
  const slugRegex = /^[a-z0-9](-?[a-z0-9])*$/;
  return slug.length >= 3 && slug.length <= 50 && slugRegex.test(slug);
}
