import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import {
  updateBlockStatus,
  updateBlockConfig,
  reorderBlocksApi,
  updatePortfolioApi,
} from '@/lib/api/portfolio'

export type Block = {
  id: string
  block_type: 'hero' | 'project_grid' | 'skills' | 'blog_feed' | 'contact'
  position: number
  config: Record<string, unknown>
  is_visible: boolean
  is_ai_generated: boolean
}

type PortfolioState = {
  portfolioId: string | null
  blocks: Block[]
  theme: string
  isPublished: boolean
  publishedUrl: string | null
  isSaving: boolean
}

type PortfolioActions = {
  initialize: (data: {
    portfolioId: string
    blocks: Block[]
    theme: string
    isPublished: boolean
    publishedUrl: string | null
  }) => void
  toggleBlock: (blockId: string) => Promise<void>
  reorderBlocks: (reordered: Block[]) => Promise<void>
  setTheme: (theme: string) => Promise<void>
  updateOptionalField: (
    blockId: string,
    config: Partial<Record<string, unknown>>
  ) => Promise<void>
}

export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  immer((set, get) => ({
    // 상태 초기값
    portfolioId: null,
    blocks: [],
    theme: 'minimalist',
    isPublished: false,
    publishedUrl: null,
    isSaving: false,

    // 초기화
    initialize: (data) => {
      set((state) => {
        state.portfolioId = data.portfolioId
        state.blocks = data.blocks
        state.theme = data.theme
        state.isPublished = data.isPublished
        state.publishedUrl = data.publishedUrl
      })
    },

    // 블록 표시 여부 토글
    toggleBlock: async (blockId) => {
      const { portfolioId, blocks } = get()
      if (!portfolioId) return

      const blockIndex = blocks.findIndex((b) => b.id === blockId)
      if (blockIndex === -1) return

      const previousStatus = blocks[blockIndex].is_visible
      const nextStatus = !previousStatus

      // 낙관적 업데이트
      set((state) => {
        state.blocks[blockIndex].is_visible = nextStatus
        state.isSaving = true
      })

      try {
        await updateBlockStatus(portfolioId, blockId, { is_visible: nextStatus })
      } catch (error) {
        console.error('Failed to toggle block:', error)
        // 롤백
        set((state) => {
          state.blocks[blockIndex].is_visible = previousStatus
        })
      } finally {
        set((state) => {
          state.isSaving = false
        })
      }
    },

    // 블록 순서 변경
    reorderBlocks: async (reordered) => {
      const { portfolioId, blocks: previousBlocks } = get()
      if (!portfolioId) return

      // 낙관적 업데이트 (UI 반영을 위해 전달받은 순서로 교체)
      set((state) => {
        state.blocks = reordered
        state.isSaving = true
      })

      try {
        await reorderBlocksApi(portfolioId, {
          blocks: reordered.map((b) => ({ id: b.id, position: b.position })),
        })
      } catch (error) {
        console.error('Failed to reorder blocks:', error)
        // 롤백
        set((state) => {
          state.blocks = previousBlocks
        })
      } finally {
        set((state) => {
          state.isSaving = false
        })
      }
    },

    // 테마 설정
    setTheme: async (theme) => {
      const { portfolioId, theme: previousTheme } = get()
      if (!portfolioId) return

      // 낙관적 업데이트
      set((state) => {
        state.theme = theme
        state.isSaving = true
      })

      try {
        await updatePortfolioApi(portfolioId, { theme })
      } catch (error) {
        console.error('Failed to set theme:', error)
        // 롤백
        set((state) => {
          state.theme = previousTheme
        })
      } finally {
        set((state) => {
          state.isSaving = false
        })
      }
    },

    // 블록 설정 업데이트 (Email, LinkedIn 등 선택 필드)
    updateOptionalField: async (blockId, configUpdate) => {
      const { portfolioId, blocks } = get()
      if (!portfolioId) return

      const blockIndex = blocks.findIndex((b) => b.id === blockId)
      if (blockIndex === -1) return

      const previousConfig = { ...blocks[blockIndex].config }
      const nextConfig = { ...previousConfig, ...configUpdate }

      // 낙관적 업데이트
      set((state) => {
        state.blocks[blockIndex].config = nextConfig
        state.isSaving = true
      })

      try {
        await updateBlockConfig(portfolioId, blockId, { config: nextConfig })
      } catch (error) {
        console.error('Failed to update config:', error)
        // 롤백
        set((state) => {
          state.blocks[blockIndex].config = previousConfig
        })
      } finally {
        set((state) => {
          state.isSaving = false
        })
      }
    },
  }))
)
