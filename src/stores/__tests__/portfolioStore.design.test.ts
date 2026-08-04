import { usePortfolioStore } from "../portfolioStore";

describe("디자인 변경 되돌리기", () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      portfolioId: "portfolio-1",
      theme: "spotify",
      designTokens: {},
      previousDesign: null,
      failedDesign: null,
      isSaving: false,
    });
    global.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  it("마지막 디자인 변경을 한 번 되돌릴 수 있다", async () => {
    await usePortfolioStore.getState().applyDesign({
      theme: "minimal",
      designTokens: {
        fontFamily: "pretendard",
        spacing: "normal",
        borderRadius: "md",
      },
    });

    expect(usePortfolioStore.getState().theme).toBe("minimal");
    await usePortfolioStore.getState().undoDesign();

    expect(usePortfolioStore.getState().theme).toBe("spotify");
    expect(usePortfolioStore.getState().designTokens).toEqual({});
  });

  it("저장 실패 시 이전 디자인으로 복구하고 오류 상태를 남긴다", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await usePortfolioStore.getState().applyDesign({ theme: "minimal" });

    expect(usePortfolioStore.getState().theme).toBe("spotify");
    expect(usePortfolioStore.getState().designError).toBe("Update failed");
  });

  it("실패한 디자인 저장을 다시 시도할 수 있다", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce({ ok: true });

    await usePortfolioStore.getState().applyDesign({ theme: "minimal" });
    const failedDesign = usePortfolioStore.getState().failedDesign;

    expect(failedDesign?.theme).toBe("minimal");
    await usePortfolioStore.getState().applyDesign(failedDesign ?? {});

    expect(usePortfolioStore.getState().theme).toBe("minimal");
    expect(usePortfolioStore.getState().designError).toBeNull();
    expect(usePortfolioStore.getState().failedDesign).toBeNull();
  });
});
