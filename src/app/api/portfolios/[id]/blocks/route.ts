import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePortfolioOwnership } from '@/lib/api/validatePortfolioOwnership'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const blocksUpdateSchema = z.object({
  blocks: z.array(z.object({
    id: z.string().uuid(),
    is_visible: z.boolean().optional(),
    position: z.number().optional(),
    config: z.any().optional(),
  }))
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
    const parsed = blocksUpdateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { blocks } = parsed.data

    // Batch update blocks using transaction
    await prisma.$transaction(
      blocks.map(block => 
        prisma.portfolioBlock.update({
          where: { 
            id: block.id,
            portfolio_id: id // Ensure the block belongs to this portfolio
          },
          data: {
            ...(block.is_visible !== undefined && { is_visible: block.is_visible }),
            ...(block.position !== undefined && { position: block.position }),
            ...(block.config && { config: block.config as any }),
          }
        })
      )
    )

    // Revalidate the portfolio viewer page
    revalidatePath(`/${portfolio!.slug}`)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH portfolio blocks error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
