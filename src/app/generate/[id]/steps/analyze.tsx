'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface AnalyzeStepProps {
  portfolioId: string
}

type SyncStatus = 'pending' | 'processing' | 'completed' | 'failed'

interface SyncJobResponse {
  status: SyncStatus
  progress: number
  synced_count?: number
  error?: string
}

type UIState = 'polling' | 'submitting' | 'timeout' | 'error'

// 폴링 규칙: 3초 간격, 120초 타임아웃 (40회)
const POLL_INTERVAL_MS = 3_000
const MAX_POLL_COUNT = 40

export default function AnalyzeStep({ portfolioId }: AnalyzeStepProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const syncJobId = searchParams.get('sync_job_id') ?? ''

  const [uiState, setUiState] = useState<UIState>('polling')
  const [errorMessage, setErrorMessage] = useState('')
  const pollCountRef = useRef(0)
  const doneRef = useRef(false) // 중복 전환 방지

  // sync job 폴링
  const { data, isError } = useQuery<SyncJobResponse>({
    queryKey: ['syncJob', syncJobId],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/github/sync/${syncJobId}`)
      if (!res.ok) throw new Error(`폴링 실패 (${res.status})`)
      return res.json()
    },
    enabled: !!syncJobId && uiState === 'polling',
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'completed' || status === 'failed') return false
      return POLL_INTERVAL_MS
    },
    retry: 2,
  })

  // 폴링 카운트 타임아웃 체크
  useEffect(() => {
    if (uiState !== 'polling') return
    pollCountRef.current += 1
    if (pollCountRef.current > MAX_POLL_COUNT) {
      setUiState('timeout')
    }
  }, [data, uiState])

  // 완료 처리: generate API 호출 후 다음 단계로 이동
  useEffect(() => {
    if (doneRef.current) return
    if (data?.status !== 'completed') return

    doneRef.current = true
    setUiState('submitting')

    const triggerGenerate = async () => {
      try {
        const res = await fetch('/api/portfolios/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ portfolio_id: portfolioId, auto_publish: true }),
        })

        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error ?? `생성 요청 실패 (${res.status})`)
        }

        const { job_id } = await res.json()
        router.push(`/generate/${portfolioId}?step=generate&generate_job_id=${job_id}`)
      } catch (err) {
        const msg = err instanceof Error ? err.message : '알 수 없는 오류'
        setErrorMessage(msg)
        setUiState('error')
        doneRef.current = false
      }
    }

    triggerGenerate()
  }, [data?.status, portfolioId, router])

  // 폴링 실패 처리
  useEffect(() => {
    if (isError && uiState === 'polling') {
      setErrorMessage('GitHub 데이터 분석 중 오류가 발생했습니다.')
      setUiState('error')
    }
    if (data?.status === 'failed' && uiState === 'polling') {
      setErrorMessage(data.error ?? '분석이 실패했습니다.')
      setUiState('error')
    }
  }, [isError, data?.status, data?.error, uiState])

  const handleRetry = () => {
    // connect 단계로 돌아가서 재시작
    router.push(`/generate/${portfolioId}`)
  }

  // --- 에러 / 타임아웃 UI ---
  if (uiState === 'timeout' || uiState === 'error') {
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">
            {uiState === 'timeout' ? '시간이 오래 걸리고 있어요' : '분석에 실패했어요'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {uiState === 'timeout'
              ? '120초가 지났습니다. 네트워크 상태를 확인하고 다시 시도해주세요.'
              : errorMessage}
          </p>
        </div>
        <Button onClick={handleRetry} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    )
  }

  // --- 폴링 / submitting UI ---
  const progress = data?.progress ?? 0
  const syncedCount = data?.synced_count ?? 0
  const statusLabel = (() => {
    if (uiState === 'submitting') return 'AI 분석 준비 중...'
    if (!data || data.status === 'pending') return '분석 준비 중...'
    if (data.status === 'processing') {
      return syncedCount > 0
        ? `레포지토리 분석 중... (${syncedCount}개 완료)`
        : '레포지토리 분석 중...'
    }
    return '분석 완료 중...'
  })()

  return (
    <div className="flex flex-col items-center gap-8 text-center w-full max-w-md">
      {/* 아이콘 영역 */}
      <div className="space-y-3">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
          <svg
            className="h-8 w-8 text-primary animate-pulse"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.121m-1.5-2.121L19 14.5m-9.25 0l-3.5 2M19 14.5l-3.5-2M5 14.5l3.5 2m5.75 0l3.5-2"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">GitHub 레포지토리 분석 중</h2>
          <p className="text-sm text-muted-foreground">{statusLabel}</p>
        </div>
      </div>

      {/* 진행률 바 */}
      <div className="w-full space-y-2">
        <Progress value={uiState === 'submitting' ? 100 : progress} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {uiState === 'submitting' ? 100 : progress}%
        </p>
      </div>

      {/* 단계 힌트 */}
      <p className="text-xs text-muted-foreground">
        레포지토리 수에 따라 최대 2분이 소요될 수 있습니다.
      </p>
    </div>
  )
}
