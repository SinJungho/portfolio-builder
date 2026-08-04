/**
 * 공개 포트폴리오에 주입되는 사용자(포트폴리오 소유자) 커스텀 CSS 살균.
 * customCss는 <style> 태그의 innerHTML로 들어가므로, </style>로 태그를 탈출해
 * 임의 HTML/스크립트를 심는 XSS와 @import 외부 스타일시트 로딩을 차단한다.
 * CSS 문법에는 '<'가 필요 없으므로 통째로 제거하면 태그 탈출 벡터가 사라진다.
 *
 * 주의: `background-image: url(https://…)` 같은 외부 리소스 참조는 막지 않는다(소유자
 * 자신의 페이지용 CSS이므로 정당한 용도). 방문자 IP 유출까지 막으려면 url()도 처리 필요.
 */
export function sanitizeCss(css: string): string {
  return css
    .replace(/</g, "") // </style> 탈출·태그 주입 차단
    .replace(/@import\b/gi, "") // 외부 스타일시트 로딩 차단
    .replace(/expression\s*\(/gi, "") // 레거시 IE 스크립트 실행 차단
    .replace(/javascript\s*:/gi, "")
    .replace(/behavior\s*:/gi, ""); // 레거시 IE behavior 차단
}
