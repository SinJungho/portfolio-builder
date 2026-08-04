import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboard = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/dashboard/page.tsx"), "utf8");
const header = readFileSync(resolve(process.cwd(), "src/components/layouts/DashboardHeader.tsx"), "utf8");
const projectModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/ProjectSelectionModal.tsx"), "utf8");
const analytics = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/analytics/page.tsx"), "utf8");
const heroModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/HeroEditorModal.tsx"), "utf8");
const skillsModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/SkillsEditorModal.tsx"), "utf8");
const blogModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/BlogFeedEditorModal.tsx"), "utf8");

describe("dashboard portfolio actions", () => {
  it("gives the mobile creation action an accessible name and visible label", () => {
    expect(header).toContain('aria-label="새 포트폴리오 만들기"');
    expect(header).toContain('title="새 포트폴리오 만들기"');
    expect(header).toContain('aria-hidden="true"');
    expect(dashboard).toContain("GitHub에서 프로젝트 불러와 포트폴리오 만들기");
    expect(dashboard).toContain('aria-hidden="true"');
  });

  it("keeps GitHub sync failures actionable and makes the published link the primary action", () => {
    expect(dashboard).toContain("원인: {syncFailure}");
    expect(dashboard).toContain("다시 시도");
    expect(dashboard).toContain("연동 설정");
    expect(dashboard).toContain("지원서용 링크 복사");
    expect(dashboard).toContain("아직 GitHub 데이터를 불러오지 않았어요.");
  });

  it("keeps the application-link journey visible and starts editing from publish readiness", () => {
    const editor = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/EditorClient.tsx"), "utf8");
    expect(dashboard).toContain("이미 만든 것만으로 충분해요");
    expect(dashboard).toContain("GitHub 확인");
    expect(dashboard).toContain("링크 공유");
    expect(dashboard).toContain("다음 한 가지");
    expect(editor).toContain('useState<SidebarTab>("publish")');
    expect(editor).toContain('aria-selected={sidebarTab === "publish"}');
    expect(editor).toContain('aria-controls="editor-panel-publish"');
    expect(editor).toContain("미리보기 확인");
    expect(editor).toContain("확인했어요");
    expect(editor).toContain("portfolio-preview-reviewed");
    expect(editor).toContain("reviewedPreviewSignature === previewSignature");
    expect(editor).toContain("focus-visible:outline-spotify-green");
  });

  it("keeps the empty state creation-focused and places existing portfolios before the compact mobile action", () => {
    expect(dashboard).toContain("아직 포트폴리오가 없어요");
    expect(dashboard).toContain("order-last md:order-first");
    expect(dashboard).toContain("min-h-32");
  });

  it("links every unresolved readiness item to its editor destination before showing confirmation", () => {
    const editor = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/EditorClient.tsx"), "utf8");
    expect(editor).toContain("onReadinessAction(item.destination)");
    // 다음으로 채울 항목을 인라인에서 강조(중복 하단 액션 행 대신)
    expect(editor).toContain("item.id === nextItem?.id");
  });

  it("keeps project selection and analytics refresh usable without a mouse", () => {
    expect(projectModal).toContain('role="dialog"');
    expect(projectModal).toContain('aria-modal="true"');
    expect(projectModal).toContain('aria-pressed={tempSelectedIds.includes(project.id)}');
    expect(projectModal).toContain("handleDialogKeyDown");
    expect(analytics).toContain("선택한 분석을 업데이트하는 중…");
    expect(analytics).toContain("aria-busy={isSummaryFetching}");
  });

  it("shares dialog semantics, labeled search, and a screen-reader chart table", () => {
    [heroModal, skillsModal, blogModal].forEach((modal) => {
      expect(modal).toContain('role="dialog"');
      expect(modal).toContain('aria-modal="true"');
      expect(modal).toContain("useDialogAccessibility");
      expect(modal).toContain("aria-label=");
    });
    expect(projectModal).toContain('htmlFor="project-search"');
    expect(projectModal).toContain('id="project-search"');
    expect(analytics).toContain('aria-describedby="visitor-trend-summary"');
    expect(analytics).toContain('<table className="sr-only">');
    expect(analytics).toContain('scope="col"');
    expect(analytics).toContain("방문자 추이 데이터가 없어요.");
  });
});
