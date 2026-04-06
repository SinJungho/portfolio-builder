import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'
import { isReservedSubdomain } from '@/utils/reserved-keywords'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth
  const hostname = req.headers.get('host') || ''

  // 1. 도메인 정보 파싱
  const isLocal = hostname.includes('localhost')
  const hostParts = hostname.replace(/:\d+$/, '').split('.')
  const mainDomain = isLocal ? 'localhost:3000' : 'portfolioforge.app'
  
  let subdomain = ''
  if (isLocal) {
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0]
    }
  } else {
    if (hostParts.length >= 3 && hostParts[0] !== 'www') {
      subdomain = hostParts[0]
    }
  }

  // 2. 보호된 경로 및 인증 경로 정의
  const protectedPaths = ['/dashboard', '/projects', '/settings', '/generate', '/onboarding', '/login', '/api/auth']
  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))

  // 3. 서브도메인이 존재하는 경우의 처리
  if (subdomain && !isReservedSubdomain(subdomain)) {
    // 3A. 서브도메인에서 대시보드/로그인 접근 시 메인 도메인으로 리다이렉트 (로그인 오류 방지)
    if (isProtectedPath) {
      const protocol = isLocal ? 'http' : 'https'
      return NextResponse.redirect(new URL(`${protocol}://${mainDomain}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url))
    }

    // 3B. 포트폴리오 페이지 리라이트
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url)
    )
  }

  // 4. 메인 도메인에서의 인증 권한 체크
  const isDashboardPath = ['/dashboard', '/projects', '/settings', '/generate', '/onboarding'].some(p => pathname.startsWith(p))
  
  if (isDashboardPath && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Next.js 내부 파일, 정적 에셋 등을 제외한 모든 경로 감시
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|icons).*)',
  ],
}
