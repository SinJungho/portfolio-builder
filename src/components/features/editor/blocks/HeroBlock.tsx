'use client'

import { Github } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeroBlockProps {
  config: {
    headline: string
    subheadline: string
    bio: string
    show_github_stats?: boolean
  }
}

export default function HeroBlock({ config }: HeroBlockProps) {
  const { headline, subheadline, bio } = config

  return (
    <section className="relative w-full py-20 px-6 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-foreground">
            {headline}
          </h1>
          <p className="text-xl md:text-2xl text-primary font-medium tracking-tight">
            {subheadline}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-2xl text-muted-foreground leading-relaxed text-lg"
        >
          {bio || "안녕하세요! 새로운 도전을 즐기는 개발자입니다."}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-4"
        >
          {config.show_github_stats && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <Github className="h-4 w-4" />
              <span className="text-xs font-semibold">GitHub Activity</span>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}
