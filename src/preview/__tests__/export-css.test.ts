import { buildPortfolioCss } from "../export-css";

describe("전문가용 CSS 내보내기", () => {
  it("현재 디자인 결과를 CSS 변수와 레거시 CSS로 내보낸다", () => {
    const css = buildPortfolioCss("minimal", {
      fontFamily: "pretendard",
      spacing: "normal",
      borderRadius: "md",
      customCss: ".custom-card { color: red; }",
    });

    expect(css).toContain(":root");
    expect(css).toContain("--pf-bg: #F7F8FA");
    expect(css).toContain("--pf-font-family");
    expect(css).toContain(".custom-card { color: red; }");
    expect(css).not.toContain("</style>");
  });
});
