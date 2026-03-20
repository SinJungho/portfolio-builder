'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Github, RefreshCw, CheckCircle2, AlertCircle, Sparkles, ArrowRight, Copy, Check, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

const TOSS_BLUE = '#3182F6'

type BioStatus = 'loading' | 'missing' | 'verified' | 'error'

const bioExamples = [
  {
    role: '백엔드',
    text: 'Backend Engineer. Java/Spring Boot/PostgreSQL. Interested in distributed systems.',
    emoji: '⚙️',
  },
  {
    role: '프론트엔드',
    text: 'Frontend Developer. React/TypeScript. UX-focused. Open to work.',
    emoji: '🎨',
  },
  {
    role: '풀스택',
    text: 'Fullstack Engineer. Node.js/React/AWS. Open-source contributor.',
    emoji: '🚀',
  },
]

export default function OnboardingBioPage() {
  const router = useRouter()
  const [status, setStatus] = useState<BioStatus>('loading')
  const [bio, setBio] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const checkBio = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true)
    try {
      if (isManual) await new Promise(r => setTimeout(r, 600))

      const res = await fetch('/api/integrations/github/bio')
      if (!res.ok) throw new Error()

      const data = await res.json()
      if (data.exists) {
        setBio(data.bio)
        setStatus('verified')
        setTimeout(() => router.push('/dashboard'), 1500)
      } else {
        setStatus('missing')
      }
    } catch {
      setStatus('error')
    } finally {
      if (isManual) setIsRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    checkBio()
  }, [checkBio])

  const handleCopyExample = (text: string, index: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    toast.success('클립보드에 복사되었습니다!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#FAFAFA] px-6 py-12">
      {/* Subtle grid background */}
      <div
        className="
          pointer-events-none absolute inset-0
          bg-[linear-gradient(rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.04)_1px,transparent_1px)]
          bg-size-[40px_40px]
          mask-[radial-gradient(ellipse_80%_60%_at_50%_50%,black_30%,transparent_100%)]
        "
      />

      {/* Blue glow */}
      <div
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full
          bg-[radial-gradient(circle,rgba(49,130,246,0.08)_0%,transparent_70%)]
        "
      />

      {/* Main Card */}
      <div
        className={`
          relative z-10 w-full max-w-[480px]
          rounded-[32px] border border-black/5
          bg-white/80 backdrop-blur-xl
          px-8 py-12
          shadow-[0_8px_40px_rgba(0,0,0,0.04)]
          transition-all duration-1000 ease-out
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}
        `}
      >
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div
            className="mb-6 flex h-16 w-16 items-center justify-center rounded-[18px]"
            style={{ background: `${TOSS_BLUE}12` }}
          >
            <Github className="h-8 w-8" style={{ color: TOSS_BLUE }} />
          </div>
          <h1 className="text-[28px] font-extrabold tracking-[-1px] text-[#191F28] leading-[1.2] mb-2">
            마지막 준비 단계예요 👋
          </h1>
          <p className="text-[15px] leading-[1.7] text-gray-500">
            GitHub Bio를 등록하면 AI가 더 정확한 소개를 만들어드려요.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: `${TOSS_BLUE}10` }}
              >
                <RefreshCw className="h-6 w-6 animate-spin" style={{ color: TOSS_BLUE }} />
              </div>
              <p className="text-[14px] font-medium text-gray-500">GitHub 프로필을 확인하는 중...</p>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex flex-col items-center justify-center py-8 gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#20C9971A]">
                <CheckCircle2 className="h-8 w-8 text-[#20C997]" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-bold text-[#191F28] mb-2">Bio 확인 완료!</p>
                <div className="mx-auto max-w-xs rounded-xl border border-black/5 bg-[#F8F9FA] px-4 py-3">
                  <p className="text-[13px] text-gray-500 italic leading-[1.6]">&quot;{bio}&quot;</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: TOSS_BLUE }}>
                <span className="inline-block h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: TOSS_BLUE }} />
                대시보드로 이동 중
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          )}

          {status === 'missing' && (
            <div className="space-y-5">
              {/* Warning Banner */}
              <div
                className="flex items-start gap-3 rounded-2xl px-5 py-4"
                style={{
                  background: '#F59E0B12',
                  border: '1px solid #F59E0B30',
                }}
              >
                <AlertCircle className="h-5 w-5 text-[#F59E0B] mt-0.5 shrink-0" />
                <div>
                  <p className="text-[14px] font-bold text-[#191F28] mb-1">GitHub Bio가 아직 없어요!</p>
                  <p className="text-[13px] text-gray-500 leading-[1.7]">
                    AI가 귀하를 소개하기 위한 첫 단서입니다. 아래 예시를 참고해 한 줄이라도 작성해주세요.
                  </p>
                </div>
              </div>

              {/* Bio Examples */}
              <div className="space-y-2.5">
                <p className="text-[12px] font-semibold text-gray-400 uppercase tracking-[0.5px]">
                  예시 (클릭하면 복사)
                </p>
                {bioExamples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleCopyExample(example.text, idx)}
                    className="
                      group flex w-full items-start gap-3
                      rounded-2xl border border-black/5 bg-[#F8F9FA]
                      px-4 py-3.5 text-left
                      transition-all duration-200
                      hover:border-[rgba(49,130,246,0.3)] hover:bg-[rgba(49,130,246,0.04)]
                      hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(49,130,246,0.08)]
                    "
                  >
                    <span className="text-[16px] shrink-0 mt-0.5">{example.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.5px]">{example.role}</span>
                      <p className="text-[13px] font-mono text-[#191F28]/70 mt-0.5 leading-[1.6] break-words">{example.text}</p>
                    </div>
                    <div className="shrink-0 mt-1">
                      {copiedIndex === idx ? (
                        <Check className="w-4 h-4 text-[#20C997]" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Link
                  href="https://github.com/settings/profile"
                  target="_blank"
                  className="
                    flex h-[48px] w-full items-center justify-center gap-2
                    rounded-full border border-black/10
                    bg-white text-[14px] font-semibold text-[#4B5563]
                    transition-all duration-200
                    hover:bg-[#F8F9FA] hover:border-black/15
                  "
                >
                  <ExternalLink className="w-4 h-4" />
                  GitHub에서 Bio 수정하기
                </Link>
                <button
                  onClick={() => checkBio(true)}
                  disabled={isRefreshing}
                  className="
                    flex h-[48px] w-full items-center justify-center gap-2
                    rounded-full text-[14px] font-semibold text-white
                    transition-all duration-200
                    disabled:opacity-60
                  "
                  style={{
                    background: TOSS_BLUE,
                    boxShadow: '0 4px 16px rgba(49,130,246,0.25)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1A6EE8'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(49,130,246,0.35)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = TOSS_BLUE
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(49,130,246,0.25)'
                  }}
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  등록 완료했어요
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center py-8 gap-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FF616120]">
                <AlertCircle className="h-8 w-8 text-[#FF6161]" />
              </div>
              <p className="text-[14px] text-[#FF6161] font-semibold">오류가 발생했습니다. 잠시 후 다시 시도해주세요.</p>
              <button
                onClick={() => checkBio(true)}
                className="text-[13px] font-semibold transition-colors"
                style={{ color: TOSS_BLUE }}
              >
                다시 시도
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-center">
          <div className="flex items-center gap-2 text-[11px] text-gray-400">
            <span className="inline-block w-1 h-1 rounded-full bg-gray-300" />
            GitHub Bio는 자기소개 블록 자동 생성에 활용됩니다.
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="relative z-10 mt-10">
        <p className="text-[11px] font-semibold text-gray-300 tracking-[2px] uppercase">
          PortfolioForge
        </p>
      </footer>
    </div>
  )
}
