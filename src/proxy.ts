import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

/**
 * Next.js 16 Proxy Function
 * 기존의 middleware.ts 역할을 수행하며, 인증 및 서브도메인 라우팅을 담당합니다.
 */
export async function proxy(req: NextRequest) {
  const session = await auth()
  const { pathname, searchParams } = req.nextUrl
  const hostname = req.headers.get('host') || ''

  // 1. 서브도메인 판별 로직 강화
  let subdomain = ''
  const hostParts = hostname.replace(/:\d+$/, '').split('.')
  const isLocal = hostname.includes('localhost')
  
  // Vercel 기본 도메인(*.vercel.app)은 서브도메인 라우팅에서 완전히 제외합니다.
  const isVercelDomain = hostname.endsWith('.vercel.app')

  if (isLocal) {
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0]
    }
  } else if (!isVercelDomain) {
    // 프로덕션: 커스텀 도메인 환경에서만 서브도메인 라우팅이 작동하도록 제한합니다.
    if (hostParts.length >= 3 && hostParts[0] !== 'www') {
      subdomain = hostParts[0]
    }
  }

  // 2. 서브도메인 접근 시 내부 라우팅 (Rewriting)
  if (subdomain && subdomain !== 'www') {
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url)
    )
  }

  // 3. 인증 보호 로직
  const protectedPaths = ['/dashboard', '/projects', '/settings', '/generate']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.url)
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
