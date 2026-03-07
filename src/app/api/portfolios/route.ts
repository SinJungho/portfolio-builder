import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const requestSchema = z.object({
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(50, 'Slug must be at most 50 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  theme: z.string().optional(),
})

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const portfolios = await prisma.portfolio.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        theme: true,
        is_published: true,
        updated_at: true,
      },
    })

    return NextResponse.json(portfolios)
  } catch (error) {
    console.error('GET /api/portfolios error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const body = await req.json().catch(() => ({}))
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { slug: requestedSlug, theme } = parsed.data

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, github_login: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Free 플랜 포트폴리오 갯수 제한 (1초과 불가)
    if (user.plan === 'free') {
      const existingCount = await prisma.portfolio.count({
        where: { user_id: userId },
      })

      if (existingCount >= 1) {
        return NextResponse.json(
          {
            error: 'plan_limit_exceeded',
            current_count: existingCount,
            limit: 1,
            upgrade_url: '/settings/billing',
          },
          { status: 403 }
        )
      }
    }

    // Slug 정책 결정
    const baseSlug = requestedSlug || user.github_login || `user-${userId.substring(0, 8)}`
    let finalSlug: string | null = null

    for (let i = 0; i < 10; i++) {
      const candidateSlug = i === 0 ? baseSlug : `${baseSlug}-${i + 1}`
      const existing = await prisma.portfolio.findUnique({
        where: { slug: candidateSlug },
        select: { id: true },
      })

      if (!existing) {
        finalSlug = candidateSlug
        break
      }
    }

    if (!finalSlug) {
      return NextResponse.json(
        { error: 'Failed to generate a unique slug. Please provide a specific slug.' },
        { status: 409 }
      )
    }

    // Portfolio 생성
    const newPortfolio = await prisma.portfolio.create({
      data: {
        user_id: userId,
        slug: finalSlug,
        theme: theme || 'minimalist',
      },
    })

    return NextResponse.json(
      {
        portfolio_id: newPortfolio.id,
        slug: newPortfolio.slug,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create portfolio:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
