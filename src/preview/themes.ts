/**
 * 포트폴리오 테마 시스템 v2
 * 토스 디자인 언어 벤치마킹 — 충분한 여백, 명확한 계층, 부드러운 인터랙션
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
  accentSoft: string;
  accentGradient: string;
  // ── Surfaces ──
  surfaceBg: string;
  cardBg: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardShadow: string;
  cardHoverShadow: string;
  cardRadius: string;
  // ── Tags ──
  tagBg: string;
  tagText: string;
  // ── Decorative ──
  decorBar: string;
  glowColor: string;
  heroGlow: string;
  // ── CTA ──
  ctaBg: string;
  ctaText: string;
  // ── Skills ──
  progressTrack: string;
  progressFill: string;
  chartColor: string;
  // ── Footer ──
  footerBg: string;
  footerText: string;
  // ── Optional ──
  pageBgGradient?: string;
  fontClass?: string;
}

export const THEMES: Record<string, ThemeTokens> = {
  minimal: {
    id: "minimal",
    label: "Minimal",
    description: "토스 스타일의 깔끔한 화이트 테마",
    bg: "#FFFFFF",
    text: "#191F28",
    textMuted: "#8B95A1",
    accent: "#3182F6",
    accentSoft: "rgba(49,130,246,0.06)",
    accentGradient: "linear-gradient(135deg, #3182F6, #6DB1FF)",
    surfaceBg: "#F7F8FA",
    cardBg: "#FFFFFF",
    cardBorder: "rgba(0,0,0,0.05)",
    cardHoverBorder: "rgba(49,130,246,0.25)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
    cardHoverShadow: "0 8px 32px rgba(49,130,246,0.1), 0 2px 8px rgba(0,0,0,0.04)",
    tagBg: "rgba(49,130,246,0.06)",
    tagText: "#3182F6",
    decorBar: "#3182F6",
    glowColor: "rgba(49,130,246,0.08)",
    heroGlow: "rgba(49,130,246,0.05)",
    ctaBg: "#3182F6",
    ctaText: "#FFFFFF",
    progressTrack: "rgba(49,130,246,0.08)",
    progressFill: "#3182F6",
    chartColor: "#3182F6",
    footerBg: "#F9FAFB",
    footerText: "#8B95A1",
    cardRadius: "20px",
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    description: "네온 액센트의 다크 모드 테마",
    bg: "#09090B",
    text: "#FAFAFA",
    textMuted: "#71717A",
    accent: "#A78BFA",
    accentSoft: "rgba(167,139,250,0.08)",
    accentGradient: "linear-gradient(135deg, #A78BFA, #818CF8)",
    surfaceBg: "#111113",
    cardBg: "rgba(255,255,255,0.03)",
    cardBorder: "rgba(255,255,255,0.06)",
    cardHoverBorder: "rgba(167,139,250,0.3)",
    cardShadow: "0 1px 3px rgba(0,0,0,0.4), 0 4px 12px rgba(0,0,0,0.2)",
    cardHoverShadow: "0 12px 40px rgba(167,139,250,0.12), 0 2px 8px rgba(0,0,0,0.3)",
    tagBg: "rgba(167,139,250,0.1)",
    tagText: "#A78BFA",
    decorBar: "#A78BFA",
    glowColor: "rgba(167,139,250,0.12)",
    heroGlow: "rgba(167,139,250,0.06)",
    ctaBg: "linear-gradient(135deg, #A78BFA, #818CF8)",
    ctaText: "#FFFFFF",
    progressTrack: "rgba(167,139,250,0.1)",
    progressFill: "#A78BFA",
    chartColor: "#A78BFA",
    footerBg: "rgba(255,255,255,0.02)",
    footerText: "#52525B",
    pageBgGradient: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(167,139,250,0.06), transparent)",
    cardRadius: "24px",
  },
  ocean: {
    id: "ocean",
    label: "Ocean",
    description: "시원한 블루-시안 그라디언트 테마",
    bg: "#F8FDFF",
    text: "#0C4A6E",
    textMuted: "#5B96AD",
    accent: "#0EA5E9",
    accentSoft: "rgba(14,165,233,0.06)",
    accentGradient: "linear-gradient(135deg, #0EA5E9, #06B6D4)",
    surfaceBg: "#EFF9FF",
    cardBg: "rgba(255,255,255,0.75)",
    cardBorder: "rgba(14,165,233,0.08)",
    cardHoverBorder: "rgba(14,165,233,0.25)",
    cardShadow: "0 1px 3px rgba(14,165,233,0.04), 0 4px 12px rgba(14,165,233,0.04)",
    cardHoverShadow: "0 12px 40px rgba(14,165,233,0.1), 0 2px 8px rgba(14,165,233,0.04)",
    tagBg: "rgba(14,165,233,0.06)",
    tagText: "#0284C7",
    decorBar: "#0EA5E9",
    glowColor: "rgba(14,165,233,0.1)",
    heroGlow: "rgba(14,165,233,0.05)",
    ctaBg: "linear-gradient(135deg, #0EA5E9, #06B6D4)",
    ctaText: "#FFFFFF",
    progressTrack: "rgba(14,165,233,0.08)",
    progressFill: "#0EA5E9",
    chartColor: "#0EA5E9",
    footerBg: "rgba(14,165,233,0.03)",
    footerText: "#5B96AD",
    pageBgGradient: "linear-gradient(180deg, #F8FDFF 0%, #EFF9FF 40%, #F8FDFF 100%)",
    cardRadius: "24px",
  },
  forest: {
    id: "forest",
    label: "Forest",
    description: "자연스러운 에메랄드 그린 테마",
    bg: "#F8FDF9",
    text: "#14532D",
    textMuted: "#5D8A6E",
    accent: "#10B981",
    accentSoft: "rgba(16,185,129,0.06)",
    accentGradient: "linear-gradient(135deg, #10B981, #34D399)",
    surfaceBg: "#EFFDF3",
    cardBg: "rgba(255,255,255,0.75)",
    cardBorder: "rgba(16,185,129,0.08)",
    cardHoverBorder: "rgba(16,185,129,0.25)",
    cardShadow: "0 1px 3px rgba(16,185,129,0.04), 0 4px 12px rgba(16,185,129,0.04)",
    cardHoverShadow: "0 12px 40px rgba(16,185,129,0.1), 0 2px 8px rgba(16,185,129,0.04)",
    tagBg: "rgba(16,185,129,0.06)",
    tagText: "#059669",
    decorBar: "#10B981",
    glowColor: "rgba(16,185,129,0.1)",
    heroGlow: "rgba(16,185,129,0.05)",
    ctaBg: "linear-gradient(135deg, #10B981, #34D399)",
    ctaText: "#FFFFFF",
    progressTrack: "rgba(16,185,129,0.08)",
    progressFill: "#10B981",
    chartColor: "#10B981",
    footerBg: "rgba(16,185,129,0.03)",
    footerText: "#5D8A6E",
    pageBgGradient: "linear-gradient(180deg, #F8FDF9 0%, #EFFDF3 40%, #F8FDF9 100%)",
    cardRadius: "20px",
  },
  sunset: {
    id: "sunset",
    label: "Sunset",
    description: "따뜻한 오렌지-퍼플 그라디언트 테마",
    bg: "#FFFCF8",
    text: "#431407",
    textMuted: "#9A7B6B",
    accent: "#F97316",
    accentSoft: "rgba(249,115,22,0.06)",
    accentGradient: "linear-gradient(135deg, #F97316, #EC4899)",
    surfaceBg: "#FFF8F0",
    cardBg: "rgba(255,255,255,0.8)",
    cardBorder: "rgba(249,115,22,0.06)",
    cardHoverBorder: "rgba(249,115,22,0.2)",
    cardShadow: "0 1px 3px rgba(249,115,22,0.04), 0 4px 12px rgba(249,115,22,0.03)",
    cardHoverShadow: "0 12px 40px rgba(249,115,22,0.1), 0 2px 8px rgba(249,115,22,0.04)",
    tagBg: "rgba(249,115,22,0.06)",
    tagText: "#EA580C",
    decorBar: "linear-gradient(90deg, #F97316, #EC4899)",
    glowColor: "rgba(249,115,22,0.1)",
    heroGlow: "rgba(249,115,22,0.05)",
    ctaBg: "linear-gradient(135deg, #F97316, #EC4899)",
    ctaText: "#FFFFFF",
    progressTrack: "rgba(249,115,22,0.08)",
    progressFill: "#F97316",
    chartColor: "#F97316",
    footerBg: "rgba(249,115,22,0.02)",
    footerText: "#9A7B6B",
    pageBgGradient: "linear-gradient(180deg, #FFFCF8 0%, #FFF8F0 40%, #FFFCF8 100%)",
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
  return THEMES[resolved] || THEMES.minimal;
}

/** 테마 목록 (선택 UI용) */
export const THEME_LIST = Object.values(THEMES);
