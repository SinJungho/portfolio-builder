'use client'

import { usePathname, useRouter } from 'next/navigation'
import { languages } from '@/i18n/settings'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

export const LanguageSwitcher = () => {
  const pathname = usePathname()
  const router = useRouter()
  
  const currentLng = typeof document !== 'undefined' 
    ? document.cookie.split('; ').find(row => row.startsWith('i18next='))?.split('=')[1] || 'ko'
    : 'ko'

  const toggleLanguage = () => {
    const nextLng = currentLng === 'ko' ? 'en' : 'ko'
    document.cookie = `i18next=${nextLng}; path=/`
    window.location.reload()
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center gap-2 text-gray-500 hover:text-[#3182F6] font-bold"
    >
      <Globe className="w-4 h-4" />
      <span className="uppercase">{currentLng}</span>
    </Button>
  )
}
