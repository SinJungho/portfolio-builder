import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import ConnectStep from './steps/connect'
import AnalyzeStep from './steps/analyze'
import GenerateStep from './steps/generate'

type Step = 'connect' | 'analyze' | 'generate' | 'adjust'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ step?: string }>
}

function getStepInfo(step: Step | undefined): { label: string; current: number; total: number } {
  switch (step) {
    case 'analyze':
      return { label: '2 / 3', current: 2, total: 3 }
    case 'generate':
      return { label: '3 / 3', current: 3, total: 3 }
    case 'adjust':
      return { label: '미세 조정', current: 3, total: 3 }
    default:
      return { label: '1 / 3', current: 1, total: 3 }
  }
}

export default async function GeneratePage({ params, searchParams }: Props) {
  // Next.js 15: params, searchParams 모두 await 필요
  const { id } = await params
  const { step: rawStep } = await searchParams

  const step = (rawStep as Step | undefined) ?? 'connect'

  // 포트폴리오 존재 여부 확인
  const portfolio = await prisma.portfolio.findUnique({
    where: { id },
    select: { id: true },
  })

  if (!portfolio) {
    notFound()
  }

  // adjust는 아직 미구현 → generate로 리다이렉트
  if (step === 'adjust') {
    redirect(`/generate/${id}?step=generate`)
  }

  const stepInfo = getStepInfo(step as Step)

  return (
    <div className="flex flex-col min-h-screen">
      {/* 전용 헤더 (사이드바 없음) */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/"
            className="text-base font-bold tracking-tight text-foreground hover:text-primary transition-colors"
          >
            PortfolioForge
          </Link>

          <div className="flex items-center gap-3">
            {/* 단계 인디케이터 */}
            <div className="flex items-center gap-1.5">
              {step !== 'adjust' &&
                [1, 2, 3].map((n) => (
                  <span
                    key={n}
                    className={`inline-block h-2 w-2 rounded-full transition-colors ${
                      n <= stepInfo.current
                        ? 'bg-primary'
                        : 'bg-muted-foreground/30'
                    }`}
                  />
                ))}
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {stepInfo.label}
            </span>
          </div>
        </div>
      </header>

      {/* Step 컴포넌트 */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {step === 'connect' && <ConnectStep portfolioId={id} />}
        {step === 'analyze' && <AnalyzeStep portfolioId={id} />}
        {step === 'generate' && <GenerateStep portfolioId={id} />}
      </main>
    </div>
  )
}
