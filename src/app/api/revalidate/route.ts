import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(req: Request) {
  try {
    const { slug } = await req.json()

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    // 포트폴리오 메인 페이지 및 기타 연관 서브패스들 캐시 무효화
    revalidatePath(`/${slug}`)
    revalidatePath(`/dashboard`)

    return NextResponse.json({ ok: true, revalidated: true })
  } catch (error) {
    console.error('Revalidation error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
