import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePortfolioOwnership } from '@/lib/api/validatePortfolioOwnership'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const patchSchema = z.object({
  theme: z.enum(['minimalist', 'creative', 'corporate', 'dark', 'pastel', 'tech']).optional(),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  title: z.string().max(255).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error, portfolio } = await validatePortfolioOwnership(id)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { theme, slug, title } = parsed.data

    // If slug is being changed, check for conflicts
    if (slug && slug !== portfolio!.slug) {
      const conflict = await prisma.portfolio.findUnique({
        where: { slug },
        select: { id: true },
      })

      if (conflict) {
        return NextResponse.json({ error: 'slug_conflict' }, { status: 409 })
      }
    }

    // Update portfolio
    const updatedPortfolio = await prisma.portfolio.update({
      where: { id },
      data: {
        ...(theme && { theme }),
        ...(slug && { slug }),
        ...(title !== undefined && { title }),
      },
    })

    // Revalidate old and new slug
    revalidatePath(`/${portfolio!.slug}`)
    if (slug && slug !== portfolio!.slug) {
      revalidatePath(`/${slug}`)
    }

    return NextResponse.json({ portfolio: updatedPortfolio })
  } catch (err) {
    console.error('PATCH portfolio error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
