type ReadinessBlock = {
  block_type: string;
  is_visible: boolean;
  config: Record<string, unknown>;
};

export const getPortfolioReadiness = (blocks: ReadinessBlock[]) => {
  const visible = (type: string) =>
    blocks.find((block) => block.block_type === type && block.is_visible);
  const projectIds = visible("project_grid")?.config.project_ids;
  const contact = visible("contact")?.config;

  return [
    { id: "hero", label: "소개", complete: Boolean(visible("hero")), action: "소개 준비하기" },
    {
      id: "projects",
      label: "대표 프로젝트",
      complete: Array.isArray(projectIds) && projectIds.length > 0,
      action: "프로젝트 고르기",
    },
    {
      id: "contact",
      label: "연락처",
      complete: Boolean(contact?.email || contact?.linkedin_url || contact?.website_url),
      action: "연락처 추가하기",
    },
  ];
};
