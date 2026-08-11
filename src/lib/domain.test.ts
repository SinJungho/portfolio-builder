import { normalizeCustomDomain } from "./domain";

describe("normalizeCustomDomain", () => {
  it("normalizes a URL to its host", () => {
    expect(normalizeCustomDomain("HTTPS://WWW.Example.com/path")).toBe("www.example.com");
    expect(normalizeCustomDomain("포트폴리오.한국")).toBe("xn--oy2b21u7xjg9agb.xn--3e0b707e");
  });

  it("rejects platform, local, credentialed, and malformed hosts", () => {
    expect(normalizeCustomDomain("user.portfolioforge.app")).toBeNull();
    expect(normalizeCustomDomain("localhost:3000")).toBeNull();
    expect(normalizeCustomDomain("https://user:pass@example.com")).toBeNull();
    expect(normalizeCustomDomain("not-a-domain")).toBeNull();
  });
});
