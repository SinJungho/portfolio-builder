import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function validatePortfolioOwnership(portfolioId: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), portfolio: null }
  }

  const portfolio = await prisma.portfolio.findUnique({
    where: { id: portfolioId },
    select: { id: true, user_id: true, slug: true },
  })

  if (!portfolio) {
    return { error: NextResponse.json({ error: 'Not Found' }, { status: 404 }), portfolio: null }
  }

  if (portfolio.user_id !== session.user.id) {
    return { error: NextResponse.json({ error: 'forbidden' }, { status: 403 }), portfolio: null }
  }

  return { error: null, portfolio, userId: session.user.id }
}
