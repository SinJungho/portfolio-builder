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

export type PortfolioReadinessGroup = {
  id: "intro" | "projects" | "contact";
  label: string;
  description: string;
  action: string;
  destination: EditorDestination;
  complete: boolean;
  items: PortfolioReadinessItem[];
  missingItems: PortfolioReadinessItem[];
};

const hasText = (value: unknown) =>
  typeof value === "string" && value.trim().length > 0;

export const getSelectedProjectIds = (blocks: ReadinessBlock[]) =>
  [...new Set(
    blocks.flatMap((block) =>
      block.block_type === "project_grid" && block.is_visible
        ? Array.isArray(block.config.project_ids)
          ? block.config.project_ids.filter(
              (projectId): projectId is string => hasText(projectId),
            )
          : []
        : [],
    ),
  )];

export const getPortfolioReadiness = (
  blocks: ReadinessBlock[],
  availableProjectIds?: Iterable<string>,
  describedProjectIds?: Iterable<string>,
): PortfolioReadinessItem[] => {
  const visible = (type: string) =>
    blocks.find((block) => block.block_type === type && block.is_visible);
  const hero = visible("hero")?.config;
  const projectIds = visible("project_grid")?.config.project_ids;
  const contact = visible("contact")?.config;
  const availableProjects = availableProjectIds === undefined
    ? null
    : new Set(availableProjectIds);
  const describedProjects = describedProjectIds === undefined
    ? null
    : new Set(describedProjectIds);
  const customDescriptions = visible("project_grid")?.config.custom_descriptions;
  const hasProjectDescription = (projectId: string) =>
    describedProjects === null ||
    describedProjects.has(projectId) ||
    (customDescriptions !== null &&
      typeof customDescriptions === "object" &&
      hasText((customDescriptions as Record<string, unknown>)[projectId]));

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
      label: "상세 소개 (선택)",
      complete: true,
      action: "소개 다듬기",
      destination: "hero",
    },
    {
      id: "projects",
      label: "대표 프로젝트",
      complete:
        Array.isArray(projectIds) &&
        projectIds.some(
          (projectId) => hasText(projectId) && (
            availableProjects === null || availableProjects.has(projectId)
          ) && hasProjectDescription(projectId),
        ),
      action: "프로젝트 고르기",
      destination: "projects",
    },
    {
      id: "contact",
      label: "연락처",
      // GitHub 링크만 있어도 채용 담당자가 연락할 수단이 있으므로 완료로 인정 (생성기가 github_url을 항상 채움)
      complete:
        hasText(contact?.github_url) ||
        hasText(contact?.email) ||
        hasText(contact?.linkedin_url) ||
        hasText(contact?.website_url),
      action: "연락처 추가하기",
      destination: "contact",
    },
  ];
};

export const getPortfolioReadinessGroups = (
  items: PortfolioReadinessItem[],
): PortfolioReadinessGroup[] => {
  const definitions = [
    {
      id: "intro" as const,
      label: "소개",
      description: "이름과 강점을 한눈에 보여줘요.",
      action: "소개 작성하기",
      destination: "hero" as const,
      itemIds: ["hero-headline", "hero-subheadline", "hero-bio"],
    },
    {
      id: "projects" as const,
      label: "대표 작업",
      description: "가장 자신 있는 GitHub 프로젝트를 골라요.",
      action: "프로젝트 고르기",
      destination: "projects" as const,
      itemIds: ["projects"],
    },
    {
      id: "contact" as const,
      label: "연락처",
      description: "채용 담당자가 연락할 방법을 남겨요.",
      action: "연락처 추가하기",
      destination: "contact" as const,
      itemIds: ["contact"],
    },
  ];

  return definitions.map((definition) => {
    const groupItems = items.filter((item) => definition.itemIds.includes(item.id));
    const missingItems = groupItems.filter((item) => !item.complete);
    return {
      id: definition.id,
      label: definition.label,
      description: definition.description,
      action: definition.action,
      destination: definition.destination,
      complete: groupItems.length > 0 && missingItems.length === 0,
      items: groupItems,
      missingItems,
    };
  });
};

export const getMissingPortfolioReadiness = (
  blocks: ReadinessBlock[],
  availableProjectIds?: Iterable<string>,
  describedProjectIds?: Iterable<string>,
) => getPortfolioReadiness(blocks, availableProjectIds, describedProjectIds).filter((item) => !item.complete);

export const isPortfolioReady = (
  blocks: ReadinessBlock[],
  availableProjectIds?: Iterable<string>,
  describedProjectIds?: Iterable<string>,
) => getMissingPortfolioReadiness(blocks, availableProjectIds, describedProjectIds).length === 0;
