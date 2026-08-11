import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { env } from '@/lib/env'
import { apiError, routeError } from '@/lib/api/errors'
import { z } from 'zod'

const revalidateSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/i).max(50).optional(),
  userId: z.string().uuid().optional(),
}).refine((value) => Boolean(value.slug || value.userId))

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("x-internal-secret");
    if (authHeader !== env.INTERNAL_API_SECRET) {
      return apiError("UNAUTHORIZED", 401);
    }

    const parsed = revalidateSchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return apiError("INVALID_REQUEST", 400)
    const { slug, userId } = parsed.data

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
