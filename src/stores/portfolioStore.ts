import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type Block = {
  id: string;
  block_type: "hero" | "project_grid" | "skills" | "blog_feed" | "contact";
  position: number;
  config: Record<string, unknown>;
  is_visible: boolean;
  is_ai_generated: boolean;
};

export type PortfolioStore = {
  // 상태
  portfolioId: string | null;
  blocks: Block[];
  theme: string;
  isPublished: boolean;
  publishedUrl: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  designTokens: any;
  customDomain: string | null;
  slug: string | null;
  isSaving: boolean; // API 호출 중 여부

  // 초기화
  initialize: (data: {
    portfolioId: string;
    blocks: Block[];
    theme: string;
    isPublished: boolean;
    publishedUrl: string | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    designTokens?: any;
    customDomain?: string | null;
    slug?: string | null;
  }) => void;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDesignTokens: (tokens: any) => Promise<void>;

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
  addBlock: (block_type: string) => Promise<void>;
  setCustomDomain: (domain: string | null) => Promise<void>;
};

export const usePortfolioStore = create<PortfolioStore>()(
  immer((set, get) => ({
    portfolioId: null,
    blocks: [],
    theme: "minimal",
    isPublished: false,
    publishedUrl: null,
    designTokens: {},
    customDomain: null,
    slug: null,
    isSaving: false,

    initialize: (data) => {
      set((state) => {
        state.portfolioId = data.portfolioId;
        state.blocks = data.blocks;
        state.theme = data.theme;
        state.isPublished = data.isPublished;
        state.publishedUrl = data.publishedUrl;
        state.designTokens = data.designTokens || {};
        state.customDomain = data.customDomain || null;
        state.slug = data.slug || null;
      });
    },

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setDesignTokens: async (tokens: any) => {
      const { portfolioId, designTokens: prevTokens } = get();
      if (!portfolioId) return;

      const newTokens = { ...prevTokens, ...tokens };

      // 낙관적 업데이트
      set((state) => {
        state.designTokens = newTokens;
        state.isSaving = true;
      });

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ design_tokens: newTokens }),
        });
        if (!res.ok) throw new Error("Update failed");
      } catch {
        // 롤백
        set((state) => {
          state.designTokens = prevTokens;
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
      } catch {
        // 롤백
        set((state) => {
          state.blocks = previousBlocks;
        });
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
      } catch {
        set((state) => {
          state.blocks = previousBlocks;
        });
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    setTheme: async (theme: string) => {
      const { portfolioId, theme: prevTheme } = get();
      if (!portfolioId) return;

      set((state) => {
        state.theme = theme;
        state.isSaving = true;
      });

      try {
        const res = await fetch(`/api/portfolios/${portfolioId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme }),
        });
        if (!res.ok) throw new Error("Update failed");
      } catch {
        set((state) => {
          state.theme = prevTheme;
        });
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
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
      } catch {
        set((state) => {
          state.blocks = previousBlocks;
        });
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
      } catch {
        set((state) => {
          state.blocks = previousBlocks;
        });
      } finally {
        set((state) => {
          state.isSaving = false;
        });
      }
    },

    updateBlockConfig: async (blockId: string, config: Record<string, unknown>) => {
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
      } catch {
        set((state) => {
          state.blocks = previousBlocks;
        });
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
      } catch (e) {
        console.error("Failed to add block", e);
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
