'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, CheckCircle2, Copy, ExternalLink, Lightbulb, Loader2, RefreshCw, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type { GenerateJobResponse } from '@/types/generate'

interface GenerateStepProps {
  portfolioId: string
}

type UIState = 'polling' | 'completed' | 'timeout' | 'error'

// 폴링 규칙: 3초 간격, 60초 타임아웃 (20회)
const POLL_INTERVAL_MS = 3_000
const MAX_POLL_COUNT = 20

export default function GenerateStep({ portfolioId }: GenerateStepProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const generateJobId = searchParams.get('generate_job_id') ?? ''

  const [uiState, setUiState] = useState<UIState>('polling')
  const [errorMessage, setErrorMessage] = useState('')
  const [completedData, setCompletedData] = useState<GenerateJobResponse | null>(null)
  const pollCountRef = useRef(0)
  const doneRef = useRef(false)

  const { data, isError } = useQuery<GenerateJobResponse>({
    queryKey: ['generateJob', generateJobId],
    queryFn: async () => {
      const res = await fetch(`/api/portfolios/generate/${generateJobId}`)
      if (!res.ok) throw new Error(`폴링 실패 (${res.status})`)
      return res.json()
    },
    enabled: !!generateJobId && uiState === 'polling',
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'completed' || status === 'failed') return false
      return POLL_INTERVAL_MS
    },
    retry: 2,
  })

  // 타임아웃 카운트
  useEffect(() => {
    if (uiState !== 'polling') return
    pollCountRef.current += 1
    if (pollCountRef.current > MAX_POLL_COUNT) {
      setUiState('timeout')
    }
  }, [data, uiState])

  // 완료 / 실패 처리
  useEffect(() => {
    if (doneRef.current) return

    if (data?.status === 'completed') {
      doneRef.current = true
      setCompletedData(data)
      setUiState('completed')
    }

    if (data?.status === 'failed') {
      doneRef.current = true
      setErrorMessage(data.error ?? '포트폴리오 생성에 실패했습니다.')
      setUiState('error')
    }
  }, [data?.status, data])

  useEffect(() => {
    if (isError && uiState === 'polling') {
      setErrorMessage('서버와 통신 중 오류가 발생했습니다.')
      setUiState('error')
    }
  }, [isError, uiState])

  const handleRetry = () => {
    router.push(`/generate/${portfolioId}`)
  }

  const handleCopyUrl = (url: string) => {
    // URL에서 프로토콜 제거하고 표시용 도메인 추출 (예: test.portfolioforge.app)
    const displayUrl = url.replace(/^https?:\/\//, '').split('/')[0]
    navigator.clipboard.writeText(url)
    toast.success('URL이 클립보드에 복사되었습니다.')
  }

  const handleViewPortfolio = () => {
    if (completedData?.published_url) {
      window.open(completedData.published_url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleAdjust = () => {
    router.push(`/generate/${portfolioId}?step=adjust`)
  }

  // --- 에러 / 타임아웃 ---
  if (uiState === 'timeout' || uiState === 'error') {
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">
            {uiState === 'timeout' ? '시간이 오래 걸리고 있어요' : '생성에 실패했어요'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {uiState === 'timeout'
              ? '60초가 지났습니다. 네트워크를 확인하고 다시 시도해주세요.'
              : errorMessage}
          </p>
        </div>
        <Button onClick={handleRetry} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          처음부터 다시 시도
        </Button>
      </div>
    )
  }

  // --- 완료 화면 ---
  if (uiState === 'completed' && completedData) {
    const publishedUrl = completedData.published_url || ''
    const displayUrl = publishedUrl.replace(/^https?:\/\//, '').split('/')[0]

    return (
      <div className="flex flex-col items-center gap-8 text-center w-full max-w-lg animate-in fade-in zoom-in-95 duration-500">
        {/* 성공 타이틀 */}
        <div className="space-y-3">
          <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">🎉 포트폴리오가 생성되었습니다!</h2>
        </div>

        {/* URL 카드 (클릭 시 복사) */}
        <button
          onClick={() => handleCopyUrl(publishedUrl)}
          className="group relative w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all text-center space-y-2 overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <Copy className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">
            {displayUrl}
          </p>
          <p className="text-xs text-muted-foreground group-hover:text-primary/70 transition-colors">
            클릭하여 주소 복사
          </p>
        </button>

        {/* 액션 버튼 */}
        <div className="flex w-full flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleViewPortfolio}
            className="flex-1 h-12 gap-2 bg-[#3182F6] hover:bg-[#2069d6] text-white rounded-xl shadow-lg shadow-blue-500/20"
          >
            배포 URL 열기
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={handleAdjust}
            className="flex-1 h-12 gap-2 rounded-xl border-slate-200 dark:border-slate-800"
          >
            미세 조정하기
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* 도움말 팁 */}
        <div className="flex items-start gap-3 text-left w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
          <div className="mt-0.5">
            <Lightbulb className="h-5 w-5 text-amber-500" />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-bold text-foreground">💡 Tip:</span> 블록 순서, 테마 색상, 연락처 정보 등은 <span className="text-foreground font-medium">미세 조정</span> 메뉴에서 언제든지 자유롭게 변경할 수 있습니다.
          </p>
        </div>
      </div>
    )
  }

  // --- 폴링 중 UI ---
  const progress = data?.progress ?? 0
  const progressMessage = progress >= 80 ? '거의 다 됐어요...' : '포트폴리오를 구성하는 중...'

  return (
    <div className="flex flex-col items-center gap-10 text-center w-full max-w-md">
      {/* 로딩 애니메이션 */}
      <div className="relative">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="h-10 w-10 text-primary animate-pulse" />
        </div>
        <div className="absolute inset-0 h-20 w-20 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>

      {/* 텍스트 메시지 */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold tracking-tight">AI가 포트폴리오를 구성 중입니다</h2>
        <p className="text-sm text-muted-foreground font-medium animate-pulse transition-all">
          {progressMessage}
        </p>
      </div>

      {/* 진행률 바 */}
      <div className="w-full space-y-3">
        <Progress value={progress} className="h-2.5 bg-slate-100 dark:bg-slate-800" />
        <div className="flex justify-between items-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>AI Generation</span>
          <span>{progress}%</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60">
        시스템이 최적의 프로젝트와 기술 스택을 선별하고 있습니다.
      </p>
    </div>
  )
}
