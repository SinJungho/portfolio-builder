import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Next.js 16 Proxy Function
 * 기존의 middleware.ts 역할을 수행하며, 인증 및 서브도메인 라우팅을 담당합니다.
 */
export async function proxy(req: NextRequest) {
  const session = await auth()
  const { pathname } = req.nextUrl
  const hostname = (req.headers.get('host') || '').toLowerCase()
  const bareHostname = hostname.replace(/:\d+$/, '')

  // 1. 서브도메인 판별 로직 강화
  let subdomain = ''
  const hostParts = bareHostname.split('.')
  const isLocal = hostname.includes('localhost')
  
  // Vercel 기본 도메인(*.vercel.app)은 서브도메인 라우팅에서 완전히 제외합니다.
  const isVercelDomain = bareHostname === 'vercel.app' || bareHostname.endsWith('.vercel.app')
  const isPortfolioForgeDomain = bareHostname === 'portfolioforge.app' || bareHostname.endsWith('.portfolioforge.app')

  if (isLocal) {
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0]
    }
  } else if (isPortfolioForgeDomain) {
    if (hostParts.length === 3 && hostParts[0] !== 'www') {
      subdomain = hostParts[0]
    }
  }

  // 2. 서브도메인 접근 시 내부 라우팅 (Rewriting)
  if (subdomain && subdomain !== 'www') {
    const rewriteUrl = req.nextUrl.clone()
    rewriteUrl.pathname = `/${subdomain}${pathname}`
    return NextResponse.rewrite(rewriteUrl)
  }

  // 플랫폼 도메인이 아닌 호스트는 저장된 커스텀 도메인과 정확히 일치할 때만 공개 포트폴리오로 보낸다.
  if (!isLocal && !isVercelDomain && !isPortfolioForgeDomain) {
    const portfolio = await prisma.portfolio.findFirst({
      where: { custom_domain: bareHostname, is_published: true },
      select: { slug: true },
    })
    if (portfolio) {
      const rewriteUrl = req.nextUrl.clone()
      rewriteUrl.pathname = pathname === '/' ? `/${portfolio.slug}` : `/${portfolio.slug}${pathname}`
      return NextResponse.rewrite(rewriteUrl)
    }
  }

  // 3. 인증 보호 로직
  const protectedPaths = ['/dashboard', '/projects', '/settings', '/generate', '/editor']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('callbackUrl', `${pathname}${req.nextUrl.search}`)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

/**
 * Proxy 설정
 * API, 정적 파일 등을 제외한 모든 경로에 대해 실행됩니다.
 */
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
}
