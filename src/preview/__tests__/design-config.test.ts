import {
  DEFAULT_DESIGN_TOKENS,
  DEFAULT_PORTFOLIO_THEME,
  getDesignChoiceLabel,
} from "../themes";

describe("채용 친화 디자인 기본값", () => {
  it("새 포트폴리오의 기본 설정을 읽기 중심으로 고정한다", () => {
    expect(DEFAULT_PORTFOLIO_THEME).toBe("minimal");
    expect(DEFAULT_DESIGN_TOKENS).toEqual({
      fontFamily: "pretendard",
      spacing: "normal",
      borderRadius: "md",
    });
  });

  it("디자인 선택지를 구현 용어가 아닌 포트폴리오 결과로 설명한다", () => {
    expect(getDesignChoiceLabel("spacing", "compact")).toBe("한 화면에 더 많이 보기");
    expect(getDesignChoiceLabel("spacing", "normal")).toBe("균형 있게 읽기");
    expect(getDesignChoiceLabel("borderRadius", "md")).toBe("균형 잡힌 기본형");
    expect(getDesignChoiceLabel("fontFamily", "pretendard")).toBe("한글을 가장 편하게 읽기");
  });
});
