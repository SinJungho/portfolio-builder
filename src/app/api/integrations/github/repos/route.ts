import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { apiError, routeError } from '@/lib/api/errors'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return apiError("UNAUTHORIZED", 401)
    }

    const userId = session.user.id

    const projects = await prisma.rawProject.findMany({
      where: { user_id: userId },
      orderBy: { pushed_at: 'desc' },
    })

    return NextResponse.json({ projects })
  } catch (error) {
    return routeError('/api/integrations/github/repos', 'GET', error)
  }
}
