import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { safeDecrypt } from '@/lib/utils/security'
import { apiError, logRouteError, routeError } from '@/lib/api/errors'


export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", 401)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { github_id: true, github_bio: true },
    })

    const currentBio = user?.github_bio
    if (!currentBio) {
    const integration = await prisma.integration.findUnique({
      where: {
        user_id_provider: {
          user_id: session.user.id,
          provider: 'github',
        },
      },
    })

    if (integration?.access_token) {
      try {
        const decryptedToken = safeDecrypt(integration.access_token)
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${decryptedToken}`,
            'User-Agent': 'PortfolioForge',
          },
        })

        if (response.ok) {
          const profile = await response.json()
          const latestBio = profile.bio

          if (latestBio && latestBio.trim().length > 0) {
            // 최신 bio를 저장하고 검증 완료로 표시한다.
            await prisma.user.update({
              where: { id: session.user.id },
              data: { 
                github_bio: latestBio,
                github_bio_verified: true 
              },
            })
            return NextResponse.json({ bio: latestBio, exists: true })
          }
        }
      } catch (error) {
        logRouteError('/api/integrations/github/bio', 'GET', error)
      }
    }
    }

    if (user?.github_bio && user.github_bio.trim().length > 0) {
    // 저장된 bio가 있으면 검증 완료로 표시한다.
    await prisma.user.update({
      where: { id: session.user.id },
      data: { github_bio_verified: true },
    })
    return NextResponse.json({ bio: user.github_bio, exists: true })
    }

    return NextResponse.json({
      bio: null,
      exists: false,
      github_settings_url: 'https://github.com/settings/profile',
    })
  } catch (error) {
    return routeError('/api/integrations/github/bio', 'GET', error)
  }
}
