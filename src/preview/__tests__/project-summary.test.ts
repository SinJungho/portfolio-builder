import { parseProjectSummary, safeHttpUrl } from "../project-summary";

describe("project summary", () => {
  it("구조화된 요약의 텍스트만 정리하고 위험한 데모 URL은 버린다", () => {
    expect(
      parseProjectSummary(
        JSON.stringify({
          headline: "  결제 실패를 재시도하는 API  ",
          highlights: [" 재시도 정책 구현 ", 3, "", "오류 로그 추가"],
          demo_url: "javascript:alert(1)",
          role: "백엔드 개발",
        }),
      ),
    ).toEqual({
      headline: "결제 실패를 재시도하는 API",
      highlights: ["재시도 정책 구현", "오류 로그 추가"],
      demo_url: null,
      role: "백엔드 개발",
    });
  });

  it("HTTP(S) 링크만 외부 링크로 허용한다", () => {
    expect(safeHttpUrl("https://example.com/demo")).toBe("https://example.com/demo");
    expect(safeHttpUrl("mailto:test@example.com")).toBeNull();
    expect(safeHttpUrl("not a url")).toBeNull();
  });
});
