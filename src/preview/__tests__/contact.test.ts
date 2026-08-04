import { describe, expect, it } from "@jest/globals";
import { hasContactMethod } from "../contact";

describe("hasContactMethod", () => {
  it("공개된 연락 수단이 하나라도 있을 때만 true를 반환한다", () => {
    expect(hasContactMethod([{ is_visible: true, block_type: "contact", config: { email: "dev@example.com" } }])).toBe(true);
    expect(hasContactMethod([{ is_visible: true, block_type: "contact", config: { email: "" } }])).toBe(false);
    expect(hasContactMethod([{ is_visible: false, block_type: "contact", config: { email: "dev@example.com" } }])).toBe(false);
  });
});
