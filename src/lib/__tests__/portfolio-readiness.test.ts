import { getPortfolioReadiness } from "../portfolio-readiness";

describe("portfolio readiness", () => {
  it("only counts visible, populated sections as ready", () => {
    const readiness = getPortfolioReadiness([
      { block_type: "hero", is_visible: true, config: {} },
      { block_type: "project_grid", is_visible: false, config: { project_ids: ["project-1"] } },
      { block_type: "contact", is_visible: true, config: { email: "dev@example.com" } },
    ]);

    expect(readiness.map((item) => item.complete)).toEqual([true, false, true]);
  });
});
