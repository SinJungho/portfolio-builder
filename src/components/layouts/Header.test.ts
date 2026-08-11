import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const header = readFileSync(resolve(process.cwd(), "src/components/layouts/Header.tsx"), "utf8");

describe("marketing header scroll state", () => {
  it("keeps the top sentinel visible inside the observer margin", () => {
    expect(header).toContain('rootMargin: "20px 0px 0px 0px"');
    expect(header).not.toContain('rootMargin: "-20px 0px 0px 0px"');
  });
});
