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

  // 1. 서브도메인 라우팅 파싱 (예: slug.localhost:3000 또는 slug.portfolioforge.app)
  let subdomain = ''
  const isLocal = hostname.includes('localhost')
  const hostParts = hostname.replace(/:\d+$/, '').split('.')

  if (isLocal) {
    // 로컬: [slug].localhost:3000
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0]
    }
  } else {
    // 프로덕션: [slug].portfolioforge.app 또는 커스텀 도메인
    // TODO: DB에서 커스텀 도메인 여부를 확인하는 로직 추가 가능 (현재는 서브도메인 방식 우선)
    if (hostParts.length >= 3 && hostParts[0] !== 'www') {
      subdomain = hostParts[0]
    }
  }

  // 2. 서브도메인 접근 시 내부 라우팅 (Rewriting)
  if (subdomain) {
    // /[slug]/path 형태로 rewrite 하여 해당 사용자의 포트폴리오 페이지를 보여줍니다.
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url)
    )
  }

  // 3. 인증 보호 로직 (기본 도메인의 특정 경로에만 적용)
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
