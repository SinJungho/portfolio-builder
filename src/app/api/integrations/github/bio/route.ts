import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. 현재 DB 정보 확인
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { github_id: true, github_bio: true },
  })

  // 2. 만약 DB에 bio가 없다면 또는 비어있다면 GitHub API에서 실시간 조회
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
        const response = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${integration.access_token}`,
            'User-Agent': 'PortfolioForge',
          },
        })

        if (response.ok) {
          const profile = await response.json()
          const latestBio = profile.bio

          if (latestBio && latestBio.trim().length > 0) {
            // DB 업데이트 (캐싱 + 검증 완료 표시)
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
        console.error('Failed to fetch latest bio from GitHub:', error)
      }
    }
  }

  // 3. 최종 결과 반환
  if (user?.github_bio && user.github_bio.trim().length > 0) {
    // 기존에 bio가 있었는데 verified가 false였다면 true로 업데이트
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
}
