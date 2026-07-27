type ReadinessBlock = {
  block_type: string;
  is_visible: boolean;
  config: Record<string, unknown>;
};

export type EditorDestination = "hero" | "projects" | "contact";

export type PortfolioReadinessItem = {
  id: string;
  label: string;
  complete: boolean;
  action: string;
  destination: EditorDestination;
};

const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

export const getPortfolioReadiness = (
  blocks: ReadinessBlock[],
): PortfolioReadinessItem[] => {
  const visible = (type: string) =>
    blocks.find((block) => block.block_type === type && block.is_visible);
  const hero = visible("hero")?.config;
  const projectIds = visible("project_grid")?.config.project_ids;
  const contact = visible("contact")?.config;

  return [
    {
      id: "hero-headline",
      label: "소개 제목",
      complete: hasText(hero?.headline),
      action: "소개 작성하기",
      destination: "hero",
    },
    {
      id: "hero-subheadline",
      label: "한 줄 소개",
      complete: hasText(hero?.subheadline),
      action: "소개 작성하기",
      destination: "hero",
    },
    {
      id: "hero-bio",
      label: "상세 소개",
      complete: hasText(hero?.bio),
      action: "소개 작성하기",
      destination: "hero",
    },
    {
      id: "projects",
      label: "대표 프로젝트",
      complete: Array.isArray(projectIds) && projectIds.some(hasText),
      action: "프로젝트 고르기",
      destination: "projects",
    },
    {
      id: "contact",
      label: "연락처",
      complete: hasText(contact?.email) || hasText(contact?.linkedin_url) || hasText(contact?.website_url),
      action: "연락처 추가하기",
      destination: "contact",
    },
  ];
};

export const getMissingPortfolioReadiness = (blocks: ReadinessBlock[]) =>
  getPortfolioReadiness(blocks).filter((item) => !item.complete);

export const isPortfolioReady = (blocks: ReadinessBlock[]) =>
  getMissingPortfolioReadiness(blocks).length === 0;
