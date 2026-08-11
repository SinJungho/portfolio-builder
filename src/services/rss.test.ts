import { isPrivateNetworkAddress, RssService, validateFeedUrl } from "./rss";

jest.mock("@/lib/prisma", () => ({ prisma: {} }));

describe("RSS URL trust boundary", () => {
  it("rejects local and IP-literal feeds, including bracketed IPv6", () => {
    expect(() => validateFeedUrl("http://127.0.0.1/feed.xml")).toThrow();
    expect(() => validateFeedUrl("http://[::1]/feed.xml")).toThrow();
    expect(() => validateFeedUrl("http://[::ffff:7f00:1]/feed.xml")).toThrow();
    expect(isPrivateNetworkAddress("[fe80::1]")).toBe(true);
  });

  it("classifies providers by hostname rather than attacker-controlled path text", () => {
    const service = new RssService();
    expect(service.getProviderFromUrl("https://velog.io/rss/@dev")).toBe("velog");
    expect(service.getProviderFromUrl("https://example.com/velog.io/feed")).toBe("custom_rss");
  });
});
