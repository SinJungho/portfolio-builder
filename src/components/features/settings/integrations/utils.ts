export type BlogProvider = "tistory" | "velog" | "medium" | "custom_rss";

export interface ProviderStyle {
  bg: string;
  text: string;
  badge: string;
  pulse: string;
  shadow: string;
}

// 1. 서비스명 매퍼를 정적 상수로 분리하여 호출 시마다 불필요한 메모리 할당 방지
const PROVIDER_DISPLAY_NAMES: Record<BlogProvider, string> = {
  tistory: "Tistory",
  velog: "Velog",
  medium: "Medium",
  custom_rss: "커스텀 RSS",
};

// 2. 비주얼 테마 스타일 매퍼를 전역 딕셔너리로 관리하여 switch 분기문을 제거하고 OCP(개방-폐쇄 원칙) 만족
const PROVIDER_STYLES: Record<BlogProvider, ProviderStyle> = {
  tistory: {
    bg: "bg-orange-500/10 border-orange-500/20",
    text: "text-orange-500",
    badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    pulse: "bg-orange-500",
    shadow: "shadow-[0_0_8px_rgba(249,115,22,0.6)]",
  },
  velog: {
    bg: "bg-emerald-500/10 border-emerald-500/20",
    text: "text-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    pulse: "bg-emerald-500",
    shadow: "shadow-[0_0_8px_rgba(16,185,129,0.6)]",
  },
  medium: {
    bg: "bg-white/10 border-white/20",
    text: "text-white",
    badge: "bg-white/10 text-white border-white/20",
    pulse: "bg-white",
    shadow: "shadow-[0_0_8px_rgba(255,255,255,0.6)]",
  },
  custom_rss: {
    bg: "bg-spotify-green/10 border-spotify-green/20",
    text: "text-spotify-green",
    badge: "bg-spotify-green/10 text-spotify-green border-spotify-green/20",
    pulse: "bg-spotify-green",
    shadow: "shadow-[0_0_8px_rgba(30,215,96,0.6)]",
  },
};

// 기본 스타일 fallback 정의
const DEFAULT_STYLE: ProviderStyle = {
  bg: "bg-white/5 border-white/5",
  text: "text-spotify-silver",
  badge: "bg-white/10 text-white border-white/10",
  pulse: "bg-spotify-green",
  shadow: "shadow-none",
};

// 블로그 서비스별 한글/대문자 표시용 브랜드 명칭 조회 함수
export const getProviderDisplayName = (
  provider: string | undefined,
): string => {
  if (!provider) return "";
  return (
    PROVIDER_DISPLAY_NAMES[provider as BlogProvider] || provider.toUpperCase()
  );
};

// 블로그 서비스 브랜드별 비주얼 테마 스타일 조회 함수
export const getProviderStyles = (
  provider: string | undefined,
): ProviderStyle => {
  if (!provider) return DEFAULT_STYLE;
  return PROVIDER_STYLES[provider as BlogProvider] || DEFAULT_STYLE;
};
