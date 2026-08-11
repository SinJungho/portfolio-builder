import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const dashboard = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/dashboard/page.tsx"), "utf8");
const header = readFileSync(resolve(process.cwd(), "src/components/layouts/DashboardHeader.tsx"), "utf8");
const sidebar = readFileSync(resolve(process.cwd(), "src/components/layouts/Sidebar.tsx"), "utf8");
const brandLogo = readFileSync(resolve(process.cwd(), "src/components/common/BrandLogo.tsx"), "utf8");
const projectModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/ProjectSelectionModal.tsx"), "utf8");
const analytics = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/analytics/page.tsx"), "utf8");
const heroModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/HeroEditorModal.tsx"), "utf8");
const skillsModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/SkillsEditorModal.tsx"), "utf8");
const blogModal = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/BlogFeedEditorModal.tsx"), "utf8");
const editorSurface = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/EditorSurface.tsx"), "utf8");
const editorHeader = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/EditorHeader.tsx"), "utf8");
const editorSidebar = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/EditorSidebar.tsx"), "utf8");
const settingsPanel = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/SettingsPanel.tsx"), "utf8");
const previewPane = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/components/PreviewPane.tsx"), "utf8");
const preview = readFileSync(resolve(process.cwd(), "src/preview/PortfolioPreview.tsx"), "utf8");
const sortableBlock = readFileSync(resolve(process.cwd(), "src/app/generate/[id]/steps/components/SortableBlockItem.tsx"), "utf8");
const proxy = readFileSync(resolve(process.cwd(), "src/proxy.ts"), "utf8");
const snapshotRoute = readFileSync(resolve(process.cwd(), "src/app/api/portfolios/[id]/snapshot/route.ts"), "utf8");

describe("dashboard portfolio actions", () => {
  it("gives the mobile creation action an accessible name and visible label", () => {
    expect(header).toContain('aria-label="새 포트폴리오 만들기"');
    expect(header).toContain('title="새 포트폴리오 만들기"');
    expect(header).toContain('aria-hidden="true"');
    expect(dashboard).toContain("GitHub에서 프로젝트 불러와 포트폴리오 만들기");
    expect(dashboard).toContain('aria-hidden="true"');
  });

  it("uses the same brand mark as the marketing header", () => {
    expect(header).toContain("<BrandLogo />");
    expect(header).toContain('rounded-full no-underline');
    expect(sidebar).toContain("<BrandLogo />");
    expect(brandLogo).toContain("Sparkles");
    expect(brandLogo).toContain("bg-spotify-green text-black");
  });

  it("keeps GitHub sync failures actionable and makes the published link the primary action", () => {
    expect(dashboard).toContain("원인: {syncFailure}");
    expect(dashboard).toContain("다시 시도");
    expect(dashboard).toContain("연동 설정");
    expect(dashboard).toContain("지원서용 링크 복사");
    expect(dashboard).toContain("아직 GitHub 데이터를 불러오지 않았어요.");
  });

  it("keeps the application-link journey visible and starts drafts from publish readiness", () => {
    const editor = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/EditorClient.tsx"), "utf8");
    expect(dashboard).toContain("이미 만든 것만으로 충분해요");
    expect(dashboard).toContain("GitHub 확인");
    expect(dashboard).toContain("링크 공유");
    expect(dashboard).toContain("다음 한 가지");
    expect(editor).toContain('initialData.isPublished ? "blocks" : "publish"');
    expect(editorSidebar).toContain("aria-selected={sidebarTab === id}");
    expect(editorSidebar).toContain('aria-controls="editor-panel"');
    expect(settingsPanel).toContain("미리보기 확인");
    expect(settingsPanel).toContain("확인했어요");
    expect(editor).toContain("portfolio-preview-reviewed");
    expect(editor).toContain("reviewedPreviewSignature === previewSignature");
    expect(settingsPanel).toContain("focus-visible:outline-spotify-green");
    expect(settingsPanel).toContain("공개 전에 미리보기로 확인해요");
    expect(settingsPanel).toContain("미리보기 확인은 선택사항이에요");
    expect(settingsPanel).toContain("저장된 변경사항은 저장 완료 후 공개 페이지에 반영돼요");
    expect(editor).not.toContain('errorMessage("PREVIEW_REQUIRED")');
    expect(previewPane).toContain("!projectsLoading && !projectsLoadFailed && portfolioState !== \"published\"");
    expect(editor).toContain("/snapshot");
    expect(settingsPanel).toContain("마지막 공개본으로 되돌리기");
    expect(editorHeader).toContain("최신 저장본");
  });

  it("keeps the empty state creation-focused and places existing portfolios before the compact mobile action", () => {
    expect(dashboard).toContain("아직 포트폴리오가 없어요");
    expect(dashboard).toContain("order-last md:order-first");
    expect(dashboard).toContain("min-h-32");
  });

  it("guides users to the next unresolved readiness item before showing confirmation", () => {
    const editor = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/EditorClient.tsx"), "utf8");
    expect(settingsPanel).toContain("onReadinessAction(actionableNextGroup.destination)");
    expect(settingsPanel).toContain("다음 준비 단계가 열려요");
    expect(editor).toContain("getPortfolioReadinessGroups(readinessItems)");
    expect(proxy).toContain("'/editor'");
    expect(snapshotRoute).toContain("snapshotSchema");
  });

  it("keeps the preview primary while preserving direct section editing", () => {
    const editor = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/editor/[id]/EditorClient.tsx"), "utf8");
    expect(editor).toContain("isInspectorOpen");
    expect(editorHeader).toContain("컨트롤 숨기기");
    expect(editorHeader).toContain('isPreviewing ? "편집" : "미리보기"');
    expect(editorSidebar).toContain('isPreviewing ? "hidden" : "flex"');
    expect(editorSidebar).toContain("overscroll-contain");
    expect(editorSidebar).not.toContain("fixed inset-x-0 bottom-0");
    expect(previewPane).toContain("MobilePreviewStatus");
    expect(editor).toContain("onSelectBlock={handlePreviewBlockSelect}");
    expect(previewPane).toContain("onSelectBlock={onSelectBlock}");
    expect(settingsPanel).toContain("맞춤 주소 연결");
    expect(preview).toContain("onSelectBlock?: (block: Block) => void");
    expect(preview).toContain("blockDisplayName[block.block_type]");
    expect(preview).toContain("<Pencil");
    expect(sortableBlock).toContain("프로젝트 편집");
    expect(sortableBlock).toContain('block.is_visible ? "공개" : "숨김"');
    expect(sortableBlock).not.toContain('includes(block.block_type) && block.is_visible');
  });

  it("keeps project selection and analytics refresh usable without a mouse", () => {
    expect(projectModal).toContain("EditorSurface");
    expect(editorSurface).toContain('role="dialog"');
    expect(editorSurface).toContain('aria-modal="true"');
    expect(projectModal).toContain('aria-pressed={tempSelectedIds.includes(project.id)}');
    expect(projectModal).toContain("handleDialogKeyDown");
    expect(analytics).toContain("선택한 분석을 업데이트하는 중…");
    expect(analytics).toContain("aria-busy={isSummaryFetching}");
  });

  it("describes private addresses, analytics selection, and noreply accounts accurately", () => {
    expect(dashboard).toContain('state === "published" ? "공개 주소" : "예정 주소"');
    expect(dashboard).not.toContain("공개 URL:");
    expect(analytics).toContain('aria-label="분석할 포트폴리오 선택"');
    expect(sidebar).toContain("isContactableEmail");
    expect(sidebar).toContain('"GitHub 계정"');
  });

  it("shares dialog semantics, labeled search, and a screen-reader chart table", () => {
    [heroModal, skillsModal, blogModal].forEach((modal) => {
      expect(modal).toContain("EditorSurface");
      expect(modal).toContain("useDialogAccessibility");
    });
    expect(editorSurface).toContain('aria-modal="true"');
    expect(editorSurface).toContain("aria-label={closeLabel}");
    expect(projectModal).toContain('htmlFor="project-search"');
    expect(projectModal).toContain('id="project-search"');
    expect(analytics).toContain('aria-describedby="visitor-trend-summary"');
    expect(analytics).toContain('<table className="sr-only">');
    expect(analytics).toContain('scope="col"');
    expect(analytics).toContain("방문자 추이 데이터가 없어요.");
  });
});
