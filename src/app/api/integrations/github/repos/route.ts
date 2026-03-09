import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    const projects = await prisma.rawProject.findMany({
      where: { user_id: userId },
      orderBy: { pushed_at: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('GET /api/integrations/github/repos error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
