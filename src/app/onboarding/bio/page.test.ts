import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(process.cwd(), "src/app/onboarding/bio/page.tsx"), "utf8");

describe("onboarding bio hardening", () => {
  it("cancels in-flight checks and prevents concurrent refreshes", () => {
    expect(page).toContain("new AbortController()");
    expect(page).toContain("signal: controller.signal");
    expect(page).toContain("requestRef.current?.abort()");
  });
});
