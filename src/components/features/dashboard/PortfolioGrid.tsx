'use client'

import { useState } from 'react'
import { MoreVertical, Plus, ExternalLink, Edit2, Loader2, Sparkles, Trash2, Globe } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface Portfolio {
  id: string
  slug: string
  title: string | null
  theme: string
  is_published: boolean
  updated_at: string
}

export function PortfolioGrid() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isCreating, setIsCreating] = useState(false)

  // 1. 포트폴리오 목록 조회
  const { data: portfolios = [], isLoading } = useQuery<Portfolio[]>({
    queryKey: ['portfolios'],
    queryFn: async () => {
      const res = await fetch('/api/portfolios')
      if (!res.ok) throw new Error('목록을 불러오지 못했습니다')
      return res.json()
    },
  })

  // 2. 새 포트폴리오 생성 뮤테이션
  const createMutation = useMutation({
    mutationFn: async () => {
      setIsCreating(true)
      const res = await fetch('/api/portfolios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'minimalist' }),
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || '생성에 실패했습니다')
      }
      
      return res.json()
    },
    onSuccess: (data) => {
      toast.success('포트폴리오가 생성되었습니다. AI 분석을 시작합니다.')
      router.push(`/generate/${data.portfolio_id}`)
    },
    onError: (error: any) => {
      toast.error(error.message)
      setIsCreating(false)
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">전체 포트폴리오</h2>
        {portfolios.length > 0 && (
          <Button 
            onClick={() => createMutation.mutate()} 
            disabled={isCreating}
            size="sm"
            className="rounded-full bg-primary hover:bg-primary/90 flex items-center gap-2"
          >
            {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            신규 생성
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 기존 포트폴리오 목록 */}
        {portfolios.map((portfolio) => (
          <Card 
            key={portfolio.id}
            className="group overflow-hidden border-slate-200 dark:border-slate-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
          >
            <div className="aspect-video bg-slate-100 dark:bg-slate-800 border-b relative flex items-center justify-center overflow-hidden">
              {/* Preview Placeholder */}
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-purple-500/5" />
              <Globe className="h-10 w-10 text-slate-300 dark:text-slate-700" />
              
              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <Badge variant={portfolio.is_published ? "default" : "secondary"} className="font-semibold shadow-sm">
                  {portfolio.is_published ? "배포됨" : "준비 중"}
                </Badge>
              </div>
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <Button variant="secondary" size="sm" asChild>
                  <Link href={`/generate/${portfolio.id}?step=adjust`}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    편집
                  </Link>
                </Button>
              </div>
            </div>

            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-lg font-bold line-clamp-1">
                {portfolio.title || "제목 없는 포트폴리오"}
              </CardTitle>
              <p className="text-xs font-mono text-muted-foreground break-all">
                {portfolio.slug}.portfolioforge.app
              </p>
            </CardHeader>

            <CardContent className="px-5 pt-0 pb-4">
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                  최근 수정
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {new Date(portfolio.updated_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1 rounded-lg border-slate-200 dark:border-slate-800 h-9">
                <Link href={`/generate/${portfolio.id}?step=adjust`}>
                  <Edit2 className="h-4 w-4 mr-2 text-slate-500" />
                  수정
                </Link>
              </Button>
              {portfolio.is_published && (
                <Button variant="secondary" size="sm" className="flex-1 rounded-lg h-9" asChild>
                  <Link href={`/${portfolio.slug}`} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    보기
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {/* 신규 생성 카드 */}
        <button
          onClick={() => createMutation.mutate()}
          disabled={isCreating}
          className="relative min-h-[16rem] bg-slate-50 dark:bg-slate-900/40 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-primary hover:bg-white dark:hover:bg-slate-900 transition-all group disabled:opacity-50"
        >
          {isCreating ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-medium animate-pulse">포트폴리오 생성 중...</p>
            </div>
          ) : (
            <>
              <div className="h-14 w-14 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-7 w-7 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="text-center">
                <span className="block text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors">
                  새 포트폴리오 만들기
                </span>
                <span className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  AI가 귀하의 경력을 분석해 즉시 생성합니다
                </span>
              </div>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
