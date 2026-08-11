import { describe, expect, it } from "@jest/globals";
import { hasContactMethod, isContactableEmail } from "../contact";

describe("hasContactMethod", () => {
  it("공개된 연락 수단이 하나라도 있을 때만 true를 반환한다", () => {
    expect(hasContactMethod([{ is_visible: true, block_type: "contact", config: { email: "dev@example.com" } }])).toBe(true);
    expect(hasContactMethod([{ is_visible: true, block_type: "contact", config: { email: "" } }])).toBe(false);
    expect(hasContactMethod([{ is_visible: false, block_type: "contact", config: { email: "dev@example.com" } }])).toBe(false);
  });

  it("GitHub noreply 주소는 연락 가능한 이메일로 취급하지 않는다", () => {
    expect(isContactableEmail("75925302@users.noreply.github.com")).toBe(false);
    expect(isContactableEmail("123+dev@users.noreply.github.com")).toBe(false);
    expect(isContactableEmail("dev@example.com")).toBe(true);
  });
});
