import { CONTRIBUTION_DAYS } from "./MockPortfolio";

test("mock contribution days match the displayed total", () => {
  expect(CONTRIBUTION_DAYS).toHaveLength(371);
  expect(CONTRIBUTION_DAYS.reduce((sum, count) => sum + count, 0)).toBe(1_428);
});
