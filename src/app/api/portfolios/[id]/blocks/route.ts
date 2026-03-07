import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePortfolioOwnership } from '@/lib/api/validatePortfolioOwnership'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const putSchema = z.object({
  blocks: z.array(
    z.object({
      id: z.string().uuid(),
      position: z.number().int(),
    })
  ),
})

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const { error, portfolio } = await validatePortfolioOwnership(id)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = putSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { blocks } = parsed.data

    // Verify all blocks belong to this portfolio
    const blockIds = blocks.map((b) => b.id)
    const existingBlocksCount = await prisma.portfolioBlock.count({
      where: {
        id: { in: blockIds },
        portfolio_id: id,
      },
    })

    if (existingBlocksCount !== blocks.length) {
      return NextResponse.json({ error: 'One or more blocks not found' }, { status: 400 })
    }

    // Transaction for bulk update
    await prisma.$transaction(
      blocks.map((b) =>
        prisma.portfolioBlock.update({
          where: { id: b.id },
          data: { position: b.position },
        })
      )
    )

    // Revalidate
    revalidatePath(`/${portfolio!.slug}`)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('PUT reorder blocks error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
