import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { apiError, routeError } from '@/lib/api/errors'

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-internal-secret");
    if (authHeader !== env.INTERNAL_API_SECRET) {
      return apiError("UNAUTHORIZED", 401);
    }

    const { slug, userId } = await req.json()

    if (!slug && !userId) {
      return apiError("INVALID_REQUEST", 400)
    }

    if (slug) {
      revalidatePath(`/${slug}`)
    }

    if (userId) {
      const portfolios = await prisma.portfolio.findMany({ where: { user_id: userId } });
      for (const p of portfolios) {
        revalidatePath(`/${p.slug}`)
      }
    }

    revalidatePath(`/dashboard`)

    return NextResponse.json({ ok: true, revalidated: true })
  } catch (error) {
    return routeError('/api/revalidate', 'POST', error)
  }
}
