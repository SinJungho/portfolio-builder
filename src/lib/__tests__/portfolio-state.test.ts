import {
  getPortfolioState,
  portfolioStateLabel,
} from "../portfolio-state";

describe("portfolio publication flow", () => {
  it("keeps an empty draft private, allows a populated preview, then publishes it", () => {
    expect(getPortfolioState(false, 0)).toBe("draft");
    expect(getPortfolioState(false, 1)).toBe("preview");
    expect(getPortfolioState(true, 1)).toBe("published");
    expect(portfolioStateLabel.preview).toBe("미리보기");
    expect(portfolioStateLabel.published).toBe("공개됨");
  });
});
