import { normalizePortfolioSlug, portfolioUrl, portfolioUrlLabel } from "../portfolio-url";

describe("portfolioUrl", () => {
  it("uses the custom domain for links and labels", () => {
    expect(portfolioUrl("jane", "portfolio.example.com")).toBe(
      "https://portfolio.example.com",
    );
    expect(portfolioUrlLabel("jane", "portfolio.example.com")).toBe(
      "portfolio.example.com",
    );
  });
});

describe("normalizePortfolioSlug", () => {
  it("turns GitHub logins and free text into a lowercase host-safe slug", () => {
    expect(normalizePortfolioSlug(" SinJungho__Portfolio ")).toBe("sinjungho-portfolio");
  });
});
