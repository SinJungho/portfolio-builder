'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Github, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ConnectStepProps {
  portfolioId: string
}

type State = 'loading' | 'error'

export default function ConnectStep({ portfolioId }: ConnectStepProps) {
  const router = useRouter()
  const [state, setState] = useState<State>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const startSync = async () => {
    setState('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/integrations/github/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `서버 오류 (${res.status})`)
      }

      const data = await res.json()
      const { job_id } = data

      if (!job_id) {
        throw new Error('job_id를 받지 못했습니다.')
      }

      // 완료 화면 없이 즉시 analyze 단계로 이동
      router.push(`/generate/${portfolioId}?step=analyze&sync_job_id=${job_id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.'
      setErrorMessage(message)
      setState('error')
    }
  }

  // 마운트 시 자동 시작
  useEffect(() => {
    startSync()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center gap-6 text-center max-w-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">연동에 실패했어요</h2>
          <p className="text-sm text-muted-foreground">{errorMessage}</p>
        </div>
        <Button onClick={startSync} className="w-full">
          <Github className="mr-2 h-4 w-4" />
          다시 시도
        </Button>
      </div>
    )
  }

  // loading state
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
        <Github className="h-8 w-8 text-primary" />
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">GitHub에 연결하는 중...</h2>
        <p className="text-sm text-muted-foreground">
          GitHub 데이터를 가져오는 중입니다. 잠시만 기다려주세요.
        </p>
      </div>
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  )
}
