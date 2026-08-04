import { Fira_Code, Inter, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";

/**
 * 프리뷰(게시 포트폴리오) 전용 폰트.
 * Latin 3종 + 한글 Pretendard 모두 next/font로 자가호스팅 — CDN·렌더 차단·레이아웃 시프트 없음.
 * (한글이 페이지 대부분을 그리는 한국어 우선 제품이라, 서체를 외부 CDN에 의존하지 않는다.
 *  방문자 IP 유출도 없음.) 어떤 Latin 폰트를 골라도 한글은 Pretendard로 폴백한다.
 */

const inter = Inter({ subsets: ["latin"], variable: "--pf-inter", display: "swap" });
const firaCode = Fira_Code({
  subsets: ["latin"],
  variable: "--pf-fira",
  display: "swap",
});
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--pf-playfair",
  display: "swap",
});
// 가변 폰트 1개로 전 굵기(400~800 extrabold까지) 커버 — 정적 굵기 다중 파일보다 가볍다.
const pretendard = localFont({
  src: "../../node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2",
  variable: "--pf-pretendard",
  display: "swap",
  weight: "45 920",
});

/** 프리뷰 루트에만 폰트 변수를 스코프 — 다른 라우트 번들은 오염하지 않음 */
export const previewFontClass = `${inter.variable} ${firaCode.variable} ${playfair.variable} ${pretendard.variable}`;

/** designTokens.fontFamily → 본문 폰트. 마지막은 항상 Pretendard(한글) → 제네릭 */
export const FONT_STACK: Record<string, string> = {
  inter: "var(--pf-inter), var(--pf-pretendard), sans-serif",
  pretendard: "var(--pf-pretendard), sans-serif",
  "fira-code": "var(--pf-fira), var(--pf-pretendard), monospace",
  // Playfair는 디스플레이 세리프 — 본문은 Inter(가독), 헤딩만 Playfair(아래 override)
  playfair: "var(--pf-inter), var(--pf-pretendard), sans-serif",
};

/**
 * 본문과 다른 헤딩 폰트가 필요한 선택지만 매핑(디스플레이 페이스의 올바른 페어링).
 * 값이 있으면 PortfolioPreview가 h1~h3에 스코프된 스타일을 주입한다.
 */
export const HEADING_FONT_OVERRIDE: Record<string, string> = {
  playfair: "var(--pf-playfair), var(--pf-pretendard), serif",
};
