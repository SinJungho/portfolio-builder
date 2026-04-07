'use client'

import { motion } from 'framer-motion'

interface Skill {
  name: string
  level: number
}

interface SkillsBlockProps {
  config: {
    chart_type: 'radar' | 'bar' | 'tag_cloud'
    skills: Skill[]
  }
}

export default function SkillsBlock({ config }: SkillsBlockProps) {
  const { skills } = config

  return (
    <section className="w-full py-16 px-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-10 justify-center text-center">
        <h2 className="text-3xl font-bold tracking-tight">Technical Skills</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
        {skills.map((skill, idx) => (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center text-sm font-semibold">
              <span className="text-foreground tracking-tight">{skill.name}</span>
              <span className="text-primary font-mono">{skill.level}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
