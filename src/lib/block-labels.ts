// 블록 표시 이름 — 사용자가 에디터에서 고르는 이름을 정본으로 삼아
// 에디터·애널리틱스·요약이 같은 이름을 쓰도록 한 곳에서 관리한다.
// 키 순서는 에디터 "새 섹션 추가" 그리드 노출 순서를 따른다.
export const blockDisplayName: Record<string, string> = {
  hero: "소개",
  project_grid: "프로젝트",
  skills: "기술 스택",
  contact: "연락처",
  blog_feed: "블로그",
};

// 각 섹션이 무엇을 담는지 한 줄 설명 — "새 섹션 추가"에서 라벨만으로는
// 무엇이 추가되는지 모르는 첫 사용자를 위해 표시한다.
export const blockDescription: Record<string, string> = {
  hero: "이름과 한 줄 소개",
  project_grid: "GitHub 프로젝트 모음",
  skills: "기술 스택과 숙련도",
  contact: "이메일·GitHub 링크",
  blog_feed: "블로그 최신 글",
};
