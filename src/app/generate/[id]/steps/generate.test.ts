import { clampProgress } from "./generate";

describe("generation progress", () => {
  it("keeps untrusted progress inside the accessible range", () => {
    expect(clampProgress(-20)).toBe(0);
    expect(clampProgress(140)).toBe(100);
    expect(clampProgress(undefined)).toBe(0);
  });
});
