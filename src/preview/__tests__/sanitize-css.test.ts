import { describe, it, expect } from "@jest/globals";
import { sanitizeCss } from "../sanitize-css";

describe("sanitizeCss", () => {
  it("</style> 태그 탈출을 차단한다", () => {
    const out = sanitizeCss("</style><script>alert(1)</script>");
    expect(out).not.toContain("<");
    expect(out).not.toContain("</style>");
    expect(out).not.toContain("<script>");
  });

  it("@import 외부 로딩을 제거한다", () => {
    const out = sanitizeCss("@import url('https://evil.example/x.css');");
    expect(out.toLowerCase()).not.toContain("@import");
  });

  it("expression()·javascript: 실행 벡터를 제거한다", () => {
    const out = sanitizeCss("a{width:expression(alert(1));background:javascript:x}");
    expect(out.toLowerCase()).not.toContain("expression(");
    expect(out.toLowerCase()).not.toContain("javascript:");
  });

  it("정상 CSS는 보존한다", () => {
    const css = ".hero{color:#1ED760;padding:8px 16px;border-radius:9999px}";
    expect(sanitizeCss(css)).toBe(css);
  });
});
