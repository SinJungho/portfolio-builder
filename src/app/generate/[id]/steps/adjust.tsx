'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  Check, 
  ChevronRight, 
  Palette, 
  Layout, 
  Eye, 
  EyeOff, 
  Loader2, 
  ArrowRight,
  ExternalLink,
  Github,
  Mail,
  Zap,
  Type,
  Maximize,
  Search,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

interface AdjustStepProps {
  portfolioId: string
}

const FONT_OPTIONS = [
  { id: 'inter', name: 'Inter (Modern)', class: 'font-sans' },
  { id: 'pretendard', name: 'Pretendard (Korean)', class: 'font-sans' },
  { id: 'fira-code', name: 'Fira Code (Tech)', class: 'font-mono' },
  { id: 'playfair', name: 'Playfair (Elegant)', class: 'font-serif' },
]

const COLOR_OPTIONS = [
  { id: 'blue', value: '#3182F6', name: 'Toss Blue' },
  { id: 'purple', value: '#8B5CF6', name: 'Modern Purple' },
  { id: 'green', value: '#10B981', name: 'Fresh Green' },
  { id: 'orange', value: '#F97316', name: 'Energetic Orange' },
  { id: 'slate', value: '#0F172A', name: 'Slate Dark' },
]

const BLOCK_LABELS: Record<string, string> = {
  hero: '히어로 (소개)',
  project_grid: '프로젝트 목록',
  skills: '기술 스택',
  blog_feed: '블로그 피드',
  contact: '연락처',
}

const BLOCK_ICONS: Record<string, any> = {
  hero: Zap,
  project_grid: Layout,
  skills: Maximize,
  blog_feed: Type,
  contact: Mail,
}

export default function AdjustStep({ portfolioId }: AdjustStepProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'blocks' | 'theme'>('blocks')
  
  // 프로젝트 선택기 상태
  const [isProjectSelectorOpen, setIsProjectSelectorOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<any>(null)
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // 데이터 페칭
  const { data, isLoading } = useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
      const res = await fetch(`/api/portfolios/${portfolioId}`)
      if (!res.ok) throw new Error('데이터를 불러오지 못했습니다.')
      return res.json()
    }
  })

  // 모든 사용 가능한 프로젝트 조회
  const { data: reposData, isLoading: isLoadingRepos } = useQuery({
    queryKey: ['githubRepos'],
    queryFn: async () => {
      const res = await fetch('/api/integrations/github/repos')
      if (!res.ok) throw new Error('저장소를 불러오지 못했습니다.')
      return res.json()
    },
    enabled: activeTab === 'blocks',
  })

  const portfolio = data?.portfolio
  const blocks = portfolio?.blocks || []
  const designTokens = portfolio?.design_tokens || {
    primaryColor: '#3182F6',
    fontFamily: 'inter',
    borderRadius: 'md',
    spacing: 'normal'
  }

  // 블록 가시성 업데이트 Mutation
  const toggleBlockMutation = useMutation({
    mutationFn: async ({ blockId, isVisible }: { blockId: string, isVisible: boolean }) => {
      const res = await fetch(`/api/portfolios/${portfolioId}/blocks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [{ id: blockId, is_visible: isVisible }]
        })
      })
      if (!res.ok) throw new Error('업데이트 실패')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] })
      toast.success('설정이 저장되었습니다.')
    }
  })

  // 디자인 토큰 업데이트 Mutation
  const updateTokensMutation = useMutation({
    mutationFn: async (tokens: any) => {
      const res = await fetch(`/api/portfolios/${portfolioId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ design_tokens: tokens })
      })
      if (!res.ok) throw new Error('업데이트 실패')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] })
      toast.success('테마가 적용되었습니다.')
    }
  })

  // 프로젝트 구성 저장 Mutation
  const updateProjectConfigMutation = useMutation({
    mutationFn: async ({ blockId, projectIds }: { blockId: string, projectIds: string[] }) => {
      const block = blocks.find((b: any) => b.id === blockId)
      const newConfig = { ...block.config, project_ids: projectIds }
      
      const res = await fetch(`/api/portfolios/${portfolioId}/blocks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [{ id: blockId, config: newConfig }]
        })
      })
      if (!res.ok) throw new Error('저장 실패')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio', portfolioId] })
      toast.success('프로젝트 구성이 변경되었습니다.')
      setIsProjectSelectorOpen(false)
    }
  })

  const openProjectSelector = (block: any) => {
    setEditingBlock(block)
    setSelectedProjectIds(block.config.project_ids || [])
    setIsProjectSelectorOpen(true)
  }

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const handleSaveProjects = () => {
    if (!editingBlock) return
    updateProjectConfigMutation.mutate({
      blockId: editingBlock.id,
      projectIds: selectedProjectIds
    })
  }

  const handleFinish = () => {
    router.push('/dashboard')
  }

  const handleView = () => {
    if (portfolio?.slug) {
      window.open(`/${portfolio.slug}`, '_blank')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-sm text-muted-foreground">설정 데이터를 불러오는 중...</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">미세 조정하기</h1>
          <p className="text-muted-foreground">AI가 생성한 결과물을 내 취향에 맞춰 다듬어보세요.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleView} className="gap-2">
            <ExternalLink className="h-4 w-4" />
            결과 보기
          </Button>
          <Button onClick={handleFinish} className="gap-2 bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 transition-all shadow-lg hover:shadow-xl">
            완료하고 대시보드로
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* 사이드바 - 메뉴 선택 */}
        <div className="md:col-span-4 space-y-2">
          <button
            onClick={() => setActiveTab('blocks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'blocks'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Layout className="h-5 w-5" />
            <span className="font-medium text-sm">블록 구성 (ON/OFF)</span>
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'theme'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'hover:bg-muted text-muted-foreground'
            }`}
          >
            <Palette className="h-5 w-5" />
            <span className="font-medium text-sm">테마 및 스타일</span>
          </button>
          
          <Separator className="my-6" />
          
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="font-bold text-foreground">Tip:</span> 실시간으로 서버에 저장되며, 공개된 URL에도 즉시 반영됩니다.
            </p>
          </div>
        </div>

        {/* 메인 영역 - 설정 디테일 */}
        <div className="md:col-span-8">
          <AnimatePresence mode="wait">
            {activeTab === 'blocks' && (
              <motion.div
                key="blocks"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="grid gap-4">
                  {blocks.map((block: any) => {
                    const Icon = BLOCK_ICONS[block.block_type] || Zap
                    return (
                      <Card key={block.id} className="p-4 flex items-center justify-between border-slate-200/60 dark:border-slate-800/60 hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${block.is_visible ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground opacity-50'}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className={`font-semibold text-sm ${!block.is_visible && 'text-muted-foreground line-through'}`}>
                              {BLOCK_LABELS[block.block_type] || block.block_type}
                            </p>
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                              {block.is_ai_generated ? 'AI GEN' : 'CUSTOM'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {block.block_type === 'project_grid' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openProjectSelector(block)}
                              className="h-9 px-3 rounded-lg text-slate-600 border-slate-200"
                            >
                              프로젝트 편집
                            </Button>
                          )}
                          <Button
                            variant={block.is_visible ? 'ghost' : 'outline'}
                            size="sm"
                            disabled={toggleBlockMutation.isPending}
                            onClick={() => toggleBlockMutation.mutate({ 
                              blockId: block.id, 
                              isVisible: !block.is_visible 
                            })}
                            className={`gap-2 h-9 px-3 rounded-lg ${block.is_visible ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : ''}`}
                          >
                            {block.is_visible ? (
                              <>
                                <Eye className="h-4 w-4" />
                                <span className="text-xs font-bold">노출 중</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4" />
                                <span className="text-xs font-bold">숨김</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {activeTab === 'theme' && (
              <motion.div
                key="theme"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                {/* 색상 선택 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full transition-all" />
                    <Label className="text-sm font-bold tracking-tight">메인 포인트 색상</Label>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {COLOR_OPTIONS.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => updateTokensMutation.mutate({
                          ...designTokens,
                          primaryColor: color.value
                        })}
                        className={`group relative h-12 w-12 rounded-full transition-all ring-offset-2 hover:ring-2 ring-primary/30 ${
                          designTokens.primaryColor === color.value ? 'ring-2 ring-primary scale-110 shadow-lg' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {designTokens.primaryColor === color.value && (
                          <div className="absolute inset-0 flex items-center justify-center text-white drop-shadow-md">
                            <Check className="h-5 w-5" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 폰트 선택 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-1 w-4 bg-primary rounded-full transition-all" />
                    <Label className="text-sm font-bold tracking-tight">대표 서체 (Typography)</Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {FONT_OPTIONS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => updateTokensMutation.mutate({
                          ...designTokens,
                          fontFamily: font.id
                        })}
                        className={`p-4 rounded-xl border text-left transition-all hover:border-primary/30 ${
                          designTokens.fontFamily === font.id
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <p className={`text-base font-semibold mb-1 ${font.class}`}>{font.name}</p>
                        <p className="text-xs text-muted-foreground">The quick brown fox jumps over the lazy dog.</p>
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 프로젝트 선택기 Sheet */}
      <Sheet open={isProjectSelectorOpen} onOpenChange={setIsProjectSelectorOpen}>
        <SheetContent side="right" className="w-[90vw] sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>프로젝트 선택</SheetTitle>
            <SheetDescription>
              포트폴리오에 노출할 프로젝트를 선택해주세요. (최대 10개)
            </SheetDescription>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="저장소 이름 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-0">
            {isLoadingRepos ? (
              <div className="flex flex-col items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary/50 mb-2" />
                <p className="text-sm text-muted-foreground">저장소 목록을 불러오는 중...</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {reposData?.projects
                  ?.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((project: any) => (
                    <button
                      key={project.id}
                      onClick={() => toggleProject(project.id)}
                      className={cn(
                        "w-full flex items-start gap-4 p-4 text-left transition-colors hover:bg-muted/50",
                        selectedProjectIds.includes(project.id) && "bg-primary/5"
                      )}
                    >
                      <div className={cn(
                        "mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-primary transition-colors",
                        selectedProjectIds.includes(project.id) ? "bg-primary text-primary-foreground" : "bg-background"
                      )}>
                        {selectedProjectIds.includes(project.id) && <Check className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm truncate">{project.name}</span>
                          {project.is_fork && <Badge variant="outline" className="text-[10px] h-4">Fork</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {project.description || '설명이 없습니다.'}
                        </p>
                        <div className="flex items-center gap-3">
                          {project.language && (
                            <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                              <span className="w-2 h-2 rounded-full bg-primary/40" />
                              {project.language}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                            <Star className="h-3 w-3" />
                            {project.stargazers_count}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                }
              </div>
            )}
          </div>

          <SheetFooter className="p-6 border-t bg-slate-50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium">
                {selectedProjectIds.length}개 선택됨
              </span>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setIsProjectSelectorOpen(false)}>취소</Button>
                <Button 
                  onClick={handleSaveProjects} 
                  disabled={updateProjectConfigMutation.isPending}
                >
                  {updateProjectConfigMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  저장하기
                </Button>
              </div>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
