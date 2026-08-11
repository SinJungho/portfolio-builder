import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { DEFAULT_DESIGN_TOKENS, DEFAULT_PORTFOLIO_THEME } from "@/preview/themes";

export type Block = {
  id: string;
  block_type: "hero" | "project_grid" | "skills" | "blog_feed" | "contact";
  position: number;
  config: Record<string, unknown>;
  is_visible: boolean;
  is_ai_generated: boolean;
};

type DesignSnapshot = {
  theme: string;
  designTokens: Record<string, unknown>;
};

export type PortfolioStore = {
  // 상태
  portfolioId: string | null;
  blocks: Block[];
  theme: string;
  isPublished: boolean;
  publishedUrl: string | null;
  designTokens: Record<string, unknown>;
  customDomain: string | null;
  slug: string | null;
  isSaving: boolean; // API 호출 중 여부
  previousDesign: DesignSnapshot | null;
  failedDesign: DesignSnapshot | null;
  designError: string | null;

  // 초기화
  initialize: (data: {
    portfolioId: string;
    blocks: Block[];
    theme: string;
    isPublished: boolean;
    publishedUrl: string | null;
    designTokens?: Record<string, unknown>;
    customDomain?: string | null;
    slug?: string | null;
  }) => void;

  setDesignTokens: (tokens: Record<string, unknown>) => Promise<void>;
  applyDesign: (design: Partial<DesignSnapshot>) => Promise<void>;
  undoDesign: () => Promise<void>;

  // 액션
  toggleBlock: (blockId: string) => Promise<void>;
  reorderBlocks: (reordered: Block[]) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  updateOptionalField: (
    blockId: string,
    config: Partial<Record<string, unknown>>,
  ) => Promise<void>;
  deleteBlock: (blockId: string) => Promise<void>;
  updateBlockConfig: (
    blockId: string,
    config: Record<string, unknown>,
  ) => Promise<void>;
  addBlock: (block_type: string) => Promise<Block | undefined>;
  setPublished: (isPublished: boolean) => Promise<void>;
  setCustomDomain: (domain: string | null) => Promise<void>;
};

export const usePortfolioStore = create<PortfolioStore>()(
  immer((set, get) => ({
    portfolioId: null,
    blocks: [],
    theme: DEFAULT_PORTFOLIO_THEME,
    isPublished: false,
    publishedUrl: null,
    designTokens: {},
    customDomain: null,
    slug: null,
    isSaving: false,
    previousDesign: null,
    failedDesign: null,
    designError: null,

    initialize: (data) => {
      set((state) => {
        state.portfolioId = data.portfolioId;
        state.blocks = data.blocks;
        state.theme = data.theme || DEFAULT_PORTFOLIO_THEME;
        state.isPublished = data.isPublished;
        state.publishedUrl = data.publishedUrl;
        state.designTokens = { ...DEFAULT_DESIGN_TOKENS, ...(data.designTokens || {}) };
        state.customDomain = data.customDomain || null;
        state.slug = data.slug || null;
        state.previousDesign = null;
        state.failedDesign = null;
        state.designError = null;
      });
    },

    applyDesign: async (design) => {
      const {
        portfolioId,
        theme: prevTheme,
        designTokens: prevTokens,
      } = get();
      if (!portfolioId) return;

      const nextTheme = design.theme || prevTheme;
      const nextTokens = design.designTokens || prevTokens;

      // 낙관적 업데이트
      set((state) => {
        state.theme = nextTheme;
        state.designTokens = nextTokens;
        state.previousDesign = { theme: prevTheme, designTokens: prevTokens };
        state.failedDesign = null;
        state.designError = null;
        state.isSaving = true;
      });

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: nextTheme, design_tokens: nextTokens }),
        });
        if (!res.ok) throw new Error("Update failed");
        set((state) => {
          state.failedDesign = null;
        });
      } catch (error) {
        // 롤백
        set((state) => {
          state.theme = prevTheme;
          state.designTokens = prevTokens;
          state.designError = error instanceof Error
            ? error.message
            : "디자인을 저장하지 못했어요.";
          state.failedDesign = { theme: nextTheme, designTokens: nextTokens };
        });
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    setDesignTokens: async (tokens: Record<string, unknown>) => {
      const { designTokens } = get();
      await get().applyDesign({ designTokens: { ...designTokens, ...tokens } });
    },

    undoDesign: async () => {
      const { portfolioId, previousDesign, theme, designTokens } = get();
      if (!portfolioId || !previousDesign) return;

      set((state) => {
        state.theme = previousDesign.theme;
        state.designTokens = previousDesign.designTokens;
        state.previousDesign = null;
        state.failedDesign = null;
        state.designError = null;
        state.isSaving = true;
      });

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            theme: previousDesign.theme,
            design_tokens: previousDesign.designTokens,
          }),
        });
        if (!res.ok) throw new Error("Update failed");
      } catch (error) {
        set((state) => {
          state.theme = theme;
          state.designTokens = designTokens;
          state.previousDesign = previousDesign;
          state.failedDesign = { theme: previousDesign.theme, designTokens: previousDesign.designTokens };
          state.designError = error instanceof Error
            ? error.message
            : "디자인을 되돌리지 못했어요.";
        });
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    toggleBlock: async (blockId: string) => {
      const { portfolioId, blocks } = get();
      if (!portfolioId) return;

      const previousBlocks = [...blocks];

      // 낙관적 업데이트
      set((state) => {
        const block = state.blocks.find((b) => b.id === blockId);
        if (block) {
          block.is_visible = !block.is_visible;
        }
        state.isSaving = true;
      });

      const updatedBlock = get().blocks.find((b) => b.id === blockId);
      if (!updatedBlock) return;

      try {
        const res = await fetch(
          `/api/portfolios/${portfolioId}/blocks/${blockId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ is_visible: updatedBlock.is_visible }),
          },
        );
        if (!res.ok) throw new Error("Update failed");
      } catch (error) {
        // 롤백
        set((state) => {
          state.blocks = previousBlocks;
        });
        throw error;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    reorderBlocks: async (reordered: Block[]) => {
      const { portfolioId, blocks: previousBlocks } = get();
      if (!portfolioId) return;

      set((state) => {
        state.blocks = reordered;
        state.isSaving = true;
      });

      try {
        const payload = {
          blocks: reordered.map((b) => ({ id: b.id, position: b.position })),
        };
        const res = await fetch(`/api/portfolios/${portfolioId}/blocks`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Update failed");
      } catch (error) {
        set((state) => {
          state.blocks = previousBlocks;
        });
        throw error;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    setTheme: async (theme: string) => {
      await get().applyDesign({ theme });
    },

    updateOptionalField: async (
      blockId: string,
      config: Partial<Record<string, unknown>>,
    ) => {
      const { portfolioId, blocks } = get();
      if (!portfolioId) return;

      const previousBlocks = [...blocks];

      set((state) => {
        const block = state.blocks.find((b) => b.id === blockId);
        if (block) {
          block.config = { ...block.config, ...config };
        }
        state.isSaving = true;
      });

      try {
        const res = await fetch(
          `/api/portfolios/${portfolioId}/blocks/${blockId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config }),
          },
        );
        if (!res.ok) throw new Error("Update failed");
      } catch (error) {
        set((state) => {
          state.blocks = previousBlocks;
        });
        throw error;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    deleteBlock: async (blockId: string) => {
      const { portfolioId, blocks: previousBlocks } = get();
      if (!portfolioId) return;

      set((state) => {
        state.blocks = state.blocks.filter((b) => b.id !== blockId);
        // Re-index positions
        state.blocks.forEach((b, i) => {
          b.position = i;
        });
        state.isSaving = true;
      });

      try {
        const res = await fetch(
          `/api/portfolios/${portfolioId}/blocks/${blockId}`,
          {
            method: "DELETE",
          },
        );
        if (!res.ok) throw new Error("Delete failed");
      } catch (error) {
        set((state) => {
          state.blocks = previousBlocks;
        });
        throw error;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    updateBlockConfig: async (
      blockId: string,
      config: Record<string, unknown>,
    ) => {
      const { portfolioId, blocks: previousBlocks } = get();
      if (!portfolioId) return;

      set((state) => {
        const block = state.blocks.find((b) => b.id === blockId);
        if (block) {
          block.config = config;
        }
        state.isSaving = true;
      });

      try {
        const res = await fetch(
          `/api/portfolios/${portfolioId}/blocks/${blockId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ config }),
          },
        );
        if (!res.ok) throw new Error("Update failed");
      } catch (error) {
        set((state) => {
          state.blocks = previousBlocks;
        });
        throw error;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    addBlock: async (block_type: string) => {
      const { portfolioId } = get();
      if (!portfolioId) return;

      set((state) => {
        state.isSaving = true;
      });

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}/blocks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ block_type }),
        });

        if (!res.ok) throw new Error("Add block failed");

        const newBlock = await res.json();

        set((state) => {
          state.blocks.push(newBlock);
        });
        return newBlock as Block;
      } catch (e) {
        console.error("Failed to add block", e);
        throw e;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },
    setPublished: async (isPublished: boolean) => {
      const { portfolioId, isPublished: previousPublished } = get();
      if (!portfolioId) return;

      set((state) => {
        state.isPublished = isPublished;
        state.isSaving = true;
      });

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ is_published: isPublished }),
        });
        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || "공개 상태를 변경하지 못했습니다.");
        }
      } catch (error) {
        set((state) => {
          state.isPublished = previousPublished;
        });
        throw error;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },
    setCustomDomain: async (domain: string | null) => {
      const { portfolioId, customDomain: prevDomain } = get();
      if (!portfolioId) return;

      // 낙관적 업데이트
      set((state) => {
        state.customDomain = domain;
        state.isSaving = true;
      });

      try {
        const method = domain ? "POST" : "DELETE";
        const res = await fetch("/api/domains", {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ portfolioId, domain }),
        });
        if (!res.ok) throw new Error("도메인 설정에 실패했습니다.");
      } catch (e) {
        // 롤백
        set((state) => {
          state.customDomain = prevDomain;
        });
        throw e;
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },
  })),
);
