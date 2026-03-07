import type { ReactNode } from 'react'
import Link from 'next/link'

interface GenerateLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
  // layout은 searchParams를 직접 받지 않으므로 단계 표시는 children에서도 가능하나,
  // 여기서는 page.tsx가 searchParams를 읽어 layout에 전달하지 않고,
  // 헤더를 Suspense 없이 정적으로 구성하는 방식을 사용합니다.
  // 단계 표시는 page.tsx의 GenerateHeader 클라이언트 컴포넌트가 담당합니다.
}

export default async function GenerateLayout({
  children,
}: GenerateLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 클라이언트 컴포넌트 헤더는 page.tsx에서 children으로 포함됩니다 */}
      {children}
    </div>
  )
}
