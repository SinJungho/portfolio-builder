import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname, searchParams } = req.nextUrl
  const session = req.auth
  const hostname = req.headers.get('host') || ''

  // 1. 서브도메인 라우팅 파싱 (예: slug.localhost:3000 또는 slug.portfolioforge.app)
  let subdomain = ''
  const isLocal = hostname.includes('localhost')
  const hostParts = hostname.replace(/:\d+$/, '').split('.')

  if (isLocal) {
    if (hostParts.length >= 2 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0]
    }
  } else {
    // Prod: slug.portfolioforge.app
    if (hostParts.length >= 3 && hostParts[0] !== 'www') {
      subdomain = hostParts[0]
    }
  }

  // 2. 서브도메인 접근 시 내부 라우팅
  if (subdomain) {
    // api 경로나 static asset은 제외하지 않는 경우도 있지만, 
    // config.matcher에서 제외했으므로 바로 rewrite 합니다.
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url)
    )
  }

  // 3. 기존 인증 보호 로직 (기본 도메인에만 적용)
  const protectedPaths = ['/dashboard', '/projects', '/settings', '/generate']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Next.js 내부 파일, api 라우트, favicon 등은 미들웨어를 거치지 않게 합니다.
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml).*)',
  ],
}
