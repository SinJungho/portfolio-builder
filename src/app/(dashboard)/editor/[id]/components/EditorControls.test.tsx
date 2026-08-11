import { fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import EditorHeader from "./EditorHeader";
import EditorSidebar from "./EditorSidebar";
import EditorSurface from "./EditorSurface";
import PreviewPane from "./PreviewPane";

jest.mock("@/preview/PortfolioPreview", () => ({
  __esModule: true,
  default: () => <div data-testid="portfolio-preview" />,
}));

describe("editor controls", () => {
  it("keeps sidebar tabs keyboard-accessible and reports changes", () => {
    const onTabChange = jest.fn();
    const onTabKeyDown = jest.fn();

    render(
      <EditorSidebar
        isPreviewing={false}
        isInspectorOpen
        sidebarTab="publish"
        onTabChange={onTabChange}
        onTabKeyDown={onTabKeyDown}
        isPending={false}
      >
        <div>패널 내용</div>
      </EditorSidebar>,
    );

    const publishTab = screen.getByRole("tab", { name: "공개 준비" });
    fireEvent.keyDown(publishTab, { key: "ArrowRight" });
    expect(onTabKeyDown).toHaveBeenCalledWith(expect.anything(), "publish");

    fireEvent.click(screen.getByRole("tab", { name: "콘텐츠 구성" }));
    expect(onTabChange).toHaveBeenCalledWith("blocks");
    expect(screen.getByRole("tabpanel").textContent).toContain("패널 내용");
  });

  it("exposes save recovery and inspector actions in the header", () => {
    const retry = jest.fn();
    const onToggleInspector = jest.fn();

    render(
      <EditorHeader
        isPublished={false}
        lastBlockOrder
        onUndoBlockOrder={jest.fn()}
        isSaving={false}
        isPreviewing={false}
        onTogglePreview={jest.fn()}
        isInspectorOpen
        onToggleInspector={onToggleInspector}
        saveError={{ message: "저장하지 못했어요.", retry }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
    fireEvent.click(screen.getByRole("button", { name: /컨트롤 숨기기/ }));

    expect(retry).toHaveBeenCalledTimes(1);
    expect(onToggleInspector).toHaveBeenCalledTimes(1);
    expect(screen.getByText("초안 · 저장 실패").getAttribute("aria-label")).toBe("초안 · 저장 실패");
  });

  it("makes modal save state and close behavior explicit", () => {
    const onSave = jest.fn();
    const onClose = jest.fn();
    const titleRef = createRef<HTMLHeadingElement>();
    const dialogRef = createRef<HTMLDivElement>();
    const props = {
      isOpen: true,
      onClose,
      onSave,
      isSaving: false,
      title: "소개 화면 편집",
      closeLabel: "소개 화면 편집 닫기",
      titleId: "editor-title",
      titleRef,
      dialogRef,
      onKeyDown: jest.fn(),
      children: <div>편집 내용</div>,
    };

    const { rerender } = render(<EditorSurface {...props} isDirty />);
    expect(screen.getByRole("status").textContent).toContain("저장 전 변경 있음");
    fireEvent.click(screen.getByRole("button", { name: "저장하고 닫기" }));
    expect(onSave).toHaveBeenCalledTimes(1);

    rerender(<EditorSurface {...props} isDirty={false} />);
    expect(screen.getByRole("status").textContent).toContain("변경 없음");
    fireEvent.click(screen.getByRole("button", { name: "닫기" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("switches preview viewport and keeps project loading recovery actionable", () => {
    const onViewportChange = jest.fn();
    const onRetryProjects = jest.fn();

    render(
      <PreviewPane
        isPreviewing
        isInspectorOpen
        onOpenInspector={jest.fn()}
        isPublished={false}
        slug="jun"
        customDomain={null}
        previewWidth="768px"
        previewRef={createRef<HTMLDivElement>()}
        projectsLoadFailed
        onRetryProjects={onRetryProjects}
        mobileStatus={<div>모바일 상태</div>}
        previewBlocks={[]}
        theme="default"
        designTokens={{} as never}
        portfolioId="portfolio-1"
        previewViewport="desktop"
        onViewportChange={onViewportChange}
        highlightedBlockId={null}
        onSelectBlock={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "태블릿 미리보기" }));
    fireEvent.click(screen.getByRole("button", { name: "다시 불러오기" }));

    expect(onViewportChange).toHaveBeenCalledWith("tablet");
    expect(onRetryProjects).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId("portfolio-preview")).not.toBeNull();
  });
});
