import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(
  resolve(process.cwd(), "src/app/generate/[id]/steps/configure.tsx"),
  "utf8",
);

describe("configure step UX boundaries", () => {
  it("keeps project selection keyboard-accessible and recoverable", () => {
    expect(source).toContain('role="checkbox"');
    expect(source).toContain("aria-checked=");
    expect(source).toContain('event.key !== "Enter" && event.key !== " "');
    expect(source).toContain("프로젝트를 불러오지 못했어요.");
    expect(source).toContain("검색 결과가 없어요.");
  });
});
