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
      const [integration, account] = await Promise.all([
        prisma.integration.findUnique({
          where: {
            user_id_provider: {
              user_id: session.user.id,
              provider: 'github',
            },
          },
          select: { access_token: true },
        }),
        prisma.account.findFirst({
          where: { userId: session.user.id, provider: 'github' },
          select: { access_token: true },
        }),
      ])
      const accessTokens = Array.from(new Set([
        safeDecrypt(integration?.access_token),
        safeDecrypt(account?.access_token),
      ].filter(Boolean)))

      if (accessTokens.length === 0) {
        return apiError('GITHUB_AUTH_EXPIRED', 401)
      }

      try {
        let response: Response | undefined
        for (const accessToken of accessTokens) {
          response = await fetch('https://api.github.com/user', {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'User-Agent': 'PortfolioForge',
            },
          })
          if (response.status !== 401) break
        }

        if (response?.status === 401) {
          return apiError('GITHUB_AUTH_EXPIRED', 401)
        }

        if (!response?.ok) {
          return apiError('GITHUB_BIO_FAILED', 503)
        }

        const profile = await response.json()
        const latestBio = profile.bio

        if (latestBio && latestBio.trim().length > 0) {
          // 최신 bio를 저장하고 검증 완료로 표시한다.
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              github_bio: latestBio,
              github_bio_verified: true,
            },
          })
          return NextResponse.json({ bio: latestBio, exists: true })
        }
      } catch (error) {
        logRouteError('/api/integrations/github/bio', 'GET', error)
        return apiError('GITHUB_BIO_FAILED', 503)
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

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return apiError("UNAUTHORIZED", 401)
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { github_bio_verified: true },
    })
    return NextResponse.json({ skipped: true })
  } catch (error) {
    return routeError('/api/integrations/github/bio', 'POST', error)
  }
}
