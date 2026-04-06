'use client'

import { Mail, Github, Linkedin, Globe, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ContactBlockProps {
  config: {
    github_url?: string
    email?: string
    linkedin_url?: string
    website_url?: string
  }
}

export default function ContactBlock({ config }: ContactBlockProps) {
  const { github_url, email, linkedin_url, website_url } = config

  const contactItems = [
    { icon: Mail, label: 'Email', value: email, href: email ? `mailto:${email}` : null },
    { icon: Github, label: 'GitHub', value: github_url, href: github_url },
    { icon: Linkedin, label: 'LinkedIn', value: linkedin_url, href: linkedin_url },
    { icon: Globe, label: 'Website', value: website_url, href: website_url },
  ].filter((item: any) => item.value)

  return (
    <section className="w-full py-20 px-6 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-10">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
            <MessageSquare className="h-3 w-3" />
            Connect
          </div>
          <h2 className="text-4xl font-bold tracking-tight">함께 성장하고 싶습니다.</h2>
          <p className="text-muted-foreground text-lg">
            새로운 기회나 궁금한 점이 있다면 언제든지 연락주세요.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {contactItems.map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.1 }}
            >
              <Button
                variant="outline"
                size="lg"
                className="rounded-2xl h-14 px-6 border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 group"
                asChild
              >
                <Link href={item.href!} target={item.label === 'Email' ? undefined : '_blank'}>
                  <item.icon className="mr-3 h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  <span className="font-semibold">{item.label}</span>
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
