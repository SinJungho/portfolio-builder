'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github, RefreshCw, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type BioStatus = 'loading' | 'missing' | 'verified' | 'error'

export default function OnboardingBioPage() {
  const router = useRouter()
  const [status, setStatus] = useState<BioStatus>('loading')
  const [bio, setBio] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkBio = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    try {
      // 1초 인위적인 딜레이(UI 애니메이션을 위한)
      if (isManual) await new Promise(r => setTimeout(r, 600))
      
      const res = await fetch('/api/integrations/github/bio')
      if (!res.ok) throw new Error()
      
      const data = await res.json()
      if (data.exists) {
        setBio(data.bio)
        setStatus('verified')
        // Verified 되면 1.5초 후 자동으로 대시보드로 이동
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setStatus('missing')
      }
    } catch (err) {
      setStatus('error')
    } finally {
      if (isManual) setIsRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    checkBio()
  }, [checkBio])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-indigo-50 via-white to-sky-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-purple-400/20 rounded-full blur-3xl" />
      
      <Card className="w-full max-w-md border-none shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30 transform hover:scale-110 transition-transform duration-300">
            <Github className="h-8 w-8 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">GitHub Bio 확인</CardTitle>
            <CardDescription className="text-muted-foreground">
              포트폴리오 생성을 위해 GitHub Bio가 필요합니다.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in fade-in duration-500">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium text-muted-foreground">GitHub 프로필을 확인하는 중...</p>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in-95 duration-500">
              <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">Bio 확인 완료!</p>
                <div className="mt-2 text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 italic">
                  "{bio}"
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-primary font-medium animate-pulse">
                대시보드로 이동 중 <ArrowRight className="h-3 w-3" />
              </div>
            </div>
          )}

          {status === 'missing' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/50 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-400">GitHub Bio가 없어요!</p>
                    <p className="text-xs text-amber-800/80 dark:text-amber-400/80 leading-relaxed">
                      AI가 귀하를 소개하기 위한 첫 번째 단서입니다. GitHub 프로필 설정에서 Bio를 한 문장이라도 작성해주세요.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button asChild variant="outline" className="w-full h-11 border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800">
                  <Link href="https://github.com/settings/profile" target="_blank">
                    GitHub에서 Bio 수정하기
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  onClick={() => checkBio(true)} 
                  disabled={isRefreshing}
                  className="w-full h-11 bg-[#3182F6] hover:bg-[#2069d6] transition-all shadow-md shadow-blue-500/20"
                >
                  {isRefreshing ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  확인 및 새로고침
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-6 space-y-4">
              <div className="h-12 w-12 rounded-full bg-destructive/10 mx-auto flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-sm text-destructive font-medium">오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
              <Button onClick={() => checkBio(true)} variant="link" size="sm">
                다시 시도
              </Button>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col border-t border-slate-100 dark:border-slate-800 pt-6">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground opacity-60">
            <span className="w-1 h-1 rounded-full bg-slate-400" />
            GitHub Bio는 이후의 자기소개 블록 자동 생성에 활용됩니다.
          </div>
        </CardFooter>
      </Card>
      
      {/* Footer Branding */}
      <footer className="mt-8 opacity-40 hover:opacity-100 transition-opacity">
        <p className="text-xs font-mono tracking-widest uppercase">PortfolioForge v1.0</p>
      </footer>
    </div>
  )
}

function ExternalLink({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
      <line x1="7" y1="17" x2="17" y2="7"></line>
      <polyline points="7 7 17 7 17 17"></polyline>
    </svg>
  )
}
