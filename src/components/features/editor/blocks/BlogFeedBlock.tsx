'use client'

import { motion } from 'framer-motion'
import { Rss } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface BlogFeedBlockProps {
  config: {
    integration_provider: string
    max_items: number
    show_thumbnail: boolean
  }
}

export default function BlogFeedBlock({ config }: BlogFeedBlockProps) {
  // 실제 포스트 연동 전에는 플레이스홀더를 렌더링한다.
  return (
    <section className="w-full py-16 px-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-2 mb-10">
        <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
          <Rss className="h-5 w-5" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Recent Posts</h2>
        <span className="ml-2 text-xs font-medium text-muted-foreground uppercase">
          from {config.integration_provider}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Card className="h-full border-slate-200 dark:border-slate-800 opacity-60">
              <CardHeader className="p-6">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-4 animate-pulse" />
                <CardTitle className="text-lg font-bold">블로그 연동 준비 중</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  포스트를 불러오는 기능이 곧 구현될 예정입니다.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
