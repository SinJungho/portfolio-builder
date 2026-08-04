/**
 * 포트폴리오 테마 시스템 v2
 * 하나의 POV로 통일: Spotify에서 파생한 "콘텐츠 우선" 규율 —
 *   · 액센트는 기능(CTA·프로그레스·활성/포커스)에만, 배경·장식엔 쓰지 않는다.
 *   · 카드는 그림자가 아니라 면 명도 + 1px 헤어라인으로 구분(플랫 엘리베이션).
 *   · 콘텐츠(프로젝트·인물 사진)가 색의 원천 — UI는 무채색을 유지한다.
 * 라이트 테마도 같은 규율을 따르는 중립 팔레트일 뿐, 별도 디자인 언어가 아니다.
 */

export interface ThemeTokens {
  id: string;
  label: string;
  description: string;
  // ── Core ──
  bg: string;
  text: string;
  textMuted: string;
  accent: string;
  // ── Surfaces ──
  surfaceBg: string;
  cardBg: string;
  cardBorder: string;
  cardRadius: string;
  // ── Tags ──
  tagBg: string;
  tagText: string;
  // ── CTA ──
  ctaBg: string;
  ctaText: string;
  // ── Footer ──
  footerBg: string;
  footerText: string;
  // ── Optional ──
  fontClass?: string;
}

export const THEMES: Record<string, ThemeTokens> = {
  spotify: {
    id: "spotify",
    label: "Spotify",
    description: "근-블랙 몰입형 다크 · 기능적 그린 액센트",
    bg: "#121212",
    text: "#FFFFFF",
    textMuted: "#B3B3B3", // #121212 대비 ≈ 8.9:1 (AA 통과)
    accent: "#1ED760",
    surfaceBg: "#181818",
    cardBg: "#1A1A1A",
    cardBorder: "rgba(255,255,255,0.08)",
    tagBg: "rgba(255,255,255,0.08)", // 태그는 무채색 — 그린은 기능(CTA·프로그레스·활성)에만
    tagText: "#E5E5E5",
    ctaBg: "#1ED760",
    ctaText: "#121212", // 그린 위 다크 텍스트 — 고대비, Spotify 정체성
    footerBg: "#181818",
    footerText: "#B3B3B3",
    cardRadius: "8px",
  },
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "깔끔한 화이트 테마 · 기능적 블루 액센트",
    bg: "#F7F8FA", // 카드(#FFFFFF)와 명도 분리 — 플랫 엘리베이션(그림자 없이 면으로 구분)
    text: "#191F28",
    textMuted: "#5E6875", // #F7F8FA 대비 ≈ 4.7:1 (AA 통과)
    accent: "#3182F6",
    surfaceBg: "#EEF0F3",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.08)",
    tagBg: "rgba(0,0,0,0.05)", // 태그 무채색 — 블루는 기능(CTA·프로그레스·활성)에만
    tagText: "#4B5563",
    ctaBg: "#3182F6",
    ctaText: "#121212", // 블루 위 화이트는 3.5:1 미달 → 다크 텍스트로 5.0:1 (AA 통과)
    footerBg: "#F9FAFB",
    footerText: "#5E6875", // #F9FAFB 대비 ≈ 5.0:1 (AA 통과)
    cardRadius: "20px",
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    description: "바이올렛 액센트의 다크 테마",
    bg: "#09090B",
    text: "#FAFAFA",
    textMuted: "#808088", // #09090B 대비 ≈ 5.1:1 (AA 통과)
    accent: "#A78BFA",
    surfaceBg: "#111113",
    cardBg: "rgba(255,255,255,0.04)",
    cardBorder: "rgba(255,255,255,0.09)",
    tagBg: "rgba(255,255,255,0.08)", // 태그 무채색 — 퍼플은 기능에만
    tagText: "#E5E5E5",
    ctaBg: "#A78BFA",
    ctaText: "#121212", // 퍼플 위 6.9:1 (AA 통과)
    footerBg: "rgba(255,255,255,0.02)",
    footerText: "#8B8B94", // #09090B 대비 ≈ 5.3:1 (AA 통과)
    cardRadius: "24px",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    description: "시원한 블루 액센트의 라이트 테마",
    bg: "#F8FDFF",
    text: "#0C4A6E",
    textMuted: "#3D7A93", // #F8FDFF 대비 ≈ 4.7:1 (AA 통과)
    accent: "#0EA5E9",
    surfaceBg: "#EFF9FF",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(14,165,233,0.16)",
    tagBg: "rgba(6,20,28,0.05)", // 태그 무채색 — 시안은 기능에만
    tagText: "#4B5563",
    ctaBg: "#0EA5E9",
    ctaText: "#121212", // 시안 위 6.8:1 (AA 통과)
    footerBg: "rgba(14,165,233,0.03)",
    footerText: "#3D7A93", // AA 통과
    cardRadius: "24px",
  },
  forest: {
    id: "forest",
    label: "Forest",
    description: "자연스러운 에메랄드 액센트의 라이트 테마",
    bg: "#F8FDF9",
    text: "#14532D",
    textMuted: "#47755A", // #F8FDF9 대비 ≈ 5.2:1 (AA 통과)
    accent: "#10B981",
    surfaceBg: "#EFFDF3",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(16,185,129,0.16)",
    tagBg: "rgba(6,20,12,0.05)", // 태그 무채색 — 그린은 기능에만
    tagText: "#4B5563",
    ctaBg: "#10B981",
    ctaText: "#121212", // 에메랄드 위 7.4:1 (AA 통과)
    footerBg: "rgba(16,185,129,0.03)",
    footerText: "#47755A", // AA 통과
    cardRadius: "20px",
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    description: "따뜻한 오렌지 액센트의 라이트 테마",
    bg: "#FFF8F0", // 카드(#FFFFFF)와 명도 분리 — 플랫 엘리베이션
    text: "#431407",
    textMuted: "#8A6A5A", // #FFF8F0 대비 ≈ 4.6:1 (AA 통과)
    accent: "#F97316",
    surfaceBg: "#FDEFE0",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(249,115,22,0.16)",
    tagBg: "rgba(28,14,4,0.05)", // 태그 무채색 — 오렌지는 기능에만
    tagText: "#4B5563",
    ctaBg: "#F97316",
    ctaText: "#121212", // 오렌지 위 6.7:1 (AA 통과)
    footerBg: "rgba(249,115,22,0.02)",
    footerText: "#8A6A5A", // AA 통과
    cardRadius: "24px",
  },
};

/** 기존 테마 이름에서 새 테마 ID로 매핑 (하위 호환) */
export function resolveTheme(themeKey: string): ThemeTokens {
  const aliasMap: Record<string, string> = {
    minimalist: "minimal",
    creative: "ocean",
    corporate: "minimal",
    dark: "midnight",
    pastel: "forest",
    tech: "midnight",
  };
  const resolved = aliasMap[themeKey] || themeKey;
  // 알 수 없는/제거된 테마 키는 라이트(minimal)로 폴백 — 라이트 테마 포트폴리오가
  // 갑자기 spotify 다크로 뒤바뀌는 급변을 방지(테마 정리 시 안전). 플래그십 기본은 여전히 spotify.
  return THEMES[resolved] || THEMES.minimal;
}

/** 테마 목록 (선택 UI용) */
export const THEME_LIST = Object.values(THEMES);

/** hex(#RGB 또는 #RRGGBB)의 WCAG 상대휘도. 파싱 실패 시 null. */
function luminance(hex: string): number | null {
  // 3자리 축약형(#0f0)도 6자리로 확장 — 커스텀 색이 파싱 실패로 대비 파생을 건너뛰던 문제 방지
  const raw = hex.trim().replace(/^#/, "");
  const full = raw.length === 3 ? raw.replace(/./g, (c) => c + c) : raw;
  const m = /^([0-9a-f]{6})$/i.exec(full);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return (
    0.2126 * lin((n >> 16) & 255) +
    0.7152 * lin((n >> 8) & 255) +
    0.0722 * lin(n & 255)
  );
}

/** 두 hex 색의 WCAG 대비비(1~21). 파싱 실패 시 1(최악)로 보수적 반환. */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  if (la === null || lb === null) return 1;
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * 배경 hex(#RRGGBB) 위에서 가독성 높은 텍스트 색을 반환.
 * WCAG 상대휘도 기준 — 밝은 배경엔 다크(#121212), 어두운 배경엔 화이트.
 * 커스텀 primaryColor를 CTA 배경으로 쓸 때 대비 붕괴(다크 위 다크) 방지용.
 */
export function readableTextOn(hex: string): string {
  const L = luminance(hex);
  if (L === null) return "#FFFFFF";
  // 0.179 = black/white 대비가 같아지는 교차점
  return L > 0.179 ? "#121212" : "#FFFFFF";
}

/**
 * 커스텀 액센트를 포커스 링·프로그레스처럼 배경 위 "가느다란 기능 요소"로 쓸 때 안전 색을 반환.
 * 배경 대비 3:1(WCAG 2.4.7 비텍스트 대비) 미달이면 테마 기본 액센트로 대체 —
 * 옅은 색 선택 시 키보드 포커스 링 소실·스킬바 판독 불가를 방지한다.
 * 채움(CTA 배경)은 그 위 텍스트를 readableTextOn으로 파생하므로 이 제약 밖.
 */
export function accentForSurface(
  accent: string,
  bg: string,
  fallback: string,
): string {
  return contrastRatio(accent, bg) >= 3 ? accent : fallback;
}
