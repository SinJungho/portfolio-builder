import {
  getMissingPortfolioReadiness,
  getPortfolioReadiness,
  isPortfolioReady,
} from "../portfolio-readiness";

describe("portfolio readiness", () => {
  const completeBlocks = [
    { block_type: "hero", is_visible: true, config: { headline: "개발자", subheadline: "문제를 해결합니다", bio: "제품을 만듭니다." } },
    { block_type: "project_grid", is_visible: true, config: { project_ids: ["project-1"] } },
    { block_type: "contact", is_visible: true, config: { email: "dev@example.com" } },
  ];

  it("requires every schema-backed introduction field", () => {
    const readiness = getPortfolioReadiness([
      { block_type: "hero", is_visible: true, config: { headline: "개발자", subheadline: "", bio: "  " } },
      ...completeBlocks.slice(1),
    ]);

    expect(getMissingPortfolioReadiness([...completeBlocks.slice(0, 1), ...completeBlocks.slice(1)])).toEqual([]);
    expect(readiness.filter((item) => !item.complete)).toEqual([
      expect.objectContaining({ id: "hero-subheadline", destination: "hero" }),
      expect.objectContaining({ id: "hero-bio", destination: "hero" }),
    ]);
    expect(isPortfolioReady(completeBlocks)).toBe(true);
    expect(isPortfolioReady([{ block_type: "hero", is_visible: false, config: completeBlocks[0].config }, ...completeBlocks.slice(1)])).toBe(false);
  });

  it("does not mark a missing selected project as ready when project data is available", () => {
    const blocks = [
      ...completeBlocks.slice(0, 1),
      { block_type: "project_grid", is_visible: true, config: { project_ids: ["missing-project"] } },
      ...completeBlocks.slice(2),
    ];

    expect(getPortfolioReadiness(blocks, ["project-1"]).find((item) => item.id === "projects")?.complete).toBe(false);
    expect(isPortfolioReady(blocks, ["project-1"])).toBe(false);
  });
});
