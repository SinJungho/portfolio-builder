import NextAuth from 'next-auth'
import authConfig from '@/auth.config'
import { NextResponse } from 'next/server'

const { auth } = NextAuth(authConfig)

/**
 * Next.js 16 Proxy 로직
 * 기존의 middleware.ts가 proxy.ts로 명칭이 변경되었습니다.
 */
export const proxy = auth(async (req) => {
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

  // 2. 커스텀 도메인 또는 서브도메인 접근 시 내부 라우팅
  if (subdomain) {
    return NextResponse.rewrite(
      new URL(`/${subdomain}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url)
    )
  }

  // 3. 커스텀 도메인 처리 (예: myportfolio.com)
  const knownHosts = ['portfolioforge.app', 'localhost', '127.0.0.1']
  const isKnownHost = knownHosts.some(h => hostname.includes(h))

  if (!isKnownHost) {
    try {
      // 도메인 해석 API 호출 (내부 호출이므로 fetch 사용)
      const resolveUrl = new URL(`/api/domains/resolve`, req.url)
      resolveUrl.searchParams.set('domain', hostname)
      
      const res = await fetch(resolveUrl)
      if (res.ok) {
        const { slug } = await res.json()
        return NextResponse.rewrite(
          new URL(`/${slug}${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`, req.url)
        )
      }
    } catch (error) {
      console.error('Proxy domain resolution failed:', error)
    }
  }

  // 4. 기존 인증 보호 로직 (기본 도메인에만 적용)
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
