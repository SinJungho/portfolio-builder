import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validatePortfolioOwnership } from '@/lib/api/validatePortfolioOwnership'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const patchSchema = z.object({
  is_visible: z.boolean().optional(),
  config: z.record(z.any()).optional(),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; blockId: string }> }
) {
  const { id, blockId } = await params

  const { error, portfolio } = await validatePortfolioOwnership(id)
  if (error) return error

  try {
    const body = await req.json()
    const parsed = patchSchema.safeParse(body)
    
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { is_visible, config } = parsed.data

    // Check if block exists and belongs to portfolio
    const block = await prisma.portfolioBlock.findUnique({
      where: { id: blockId, portfolio_id: id },
    })

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    // Update block
    const updatedBlock = await prisma.portfolioBlock.update({
      where: { id: blockId },
      data: {
        ...(is_visible !== undefined && { is_visible }),
        ...(config !== undefined && { config }),
      },
    })

    // Revalidate
    revalidatePath(`/${portfolio!.slug}`)

    return NextResponse.json({ block: updatedBlock })
  } catch (err) {
    console.error('PATCH block error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
