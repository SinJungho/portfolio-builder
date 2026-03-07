import { prisma } from '@/lib/prisma'
import { redis, JOB_KEY, type JobStatus } from '@/lib/redis'
import { env } from '@/lib/env'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY })

function calculateAiScore(p: any): number {
  if (p.ai_score !== null && p.ai_score !== undefined) return p.ai_score

  let readmeQuality = 0.0
  let recency = 0.1
  let stars = Math.min((p.stargazers_count || 0) / 100, 1.0)

  const rawData = p.raw_data as any || {}
  const readme = rawData.readme || ''

  if (readme) {
    if (readme.length < 300) {
      readmeQuality = 0.3
    } else {
      readmeQuality = 0.6
      if (readme.includes('![')) readmeQuality += 0.2
      if (readme.includes('```')) readmeQuality += 0.1
    }
  }

  if (p.pushed_at) {
    const days = (new Date().getTime() - new Date(p.pushed_at).getTime()) / (1000 * 3600 * 24)
    if (days <= 30) recency = 1.0
    else if (days <= 90) recency = 0.7
    else if (days <= 180) recency = 0.4
  }

  return stars * 0.3 + recency * 0.4 + readmeQuality * 0.3
}

export async function generatePortfolio({
  jobId,
  portfolioId,
  userId,
  autoPublish,
}: {
  jobId: string
  portfolioId: string
  userId: string
  autoPublish: boolean
}): Promise<void> {
  const updateProgress = async (progress: number, updates: Partial<JobStatus> = {}) => {
    try {
      const key = JOB_KEY(jobId)
      const cached = await redis.get(key)
      let current: JobStatus = cached
        ? typeof cached === 'string' ? JSON.parse(cached) : cached
        : {
            status: 'pending',
            progress: 0,
            portfolio_id: portfolioId,
            user_id: userId,
            auto_publish: autoPublish,
          }

      current = { ...current, ...updates, progress }
      await redis.set(key, JSON.stringify(current), { ex: 600 })
    } catch (err) {
      console.error(`Failed to update progress for job ${jobId}:`, err)
    }
  }

  try {
    // progress 0
    await updateProgress(0, { status: 'processing' })

    // progress 10: users, raw_projects 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        raw_projects: true,
        integrations: {
          where: { is_active: true },
        },
      },
    })

    if (!user) throw new Error('User not found')
    await updateProgress(10)

    // progress 30: hero 블록 생성
    const languageCounts: Record<string, number> = {}
    let totalProjects = 0

    user.raw_projects.forEach((p) => {
      if (p.language) {
        languageCounts[p.language] = (languageCounts[p.language] || 0) + 1
      }
      totalProjects++
    })

    const sortedLangs = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)

    const skillsString = sortedLangs.map((l) => l[0]).join(', ') || '알 수 없음'

    let subheadline = user.github_bio?.substring(0, 50) || '안녕하세요. 개발자입니다.'
    const prompt = `GitHub bio: ${user.github_bio || '없음'}\n사용 언어: ${skillsString}\n위 정보를 바탕으로 채용 담당자에게 어필할 수 있는 한 줄 소개를 한국어로 작성해줘. 직군 + 핵심 기술 + 강점 형태로, 50자 이내로.`

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
      })
      if (response.choices[0]?.message?.content) {
        subheadline = response.choices[0].message.content.trim().substring(0, 200) // DB limit
      }
    } catch (openaiErr) {
      console.error('OpenAI generation failed, using fallback:', openaiErr)
      // subheadline fallback already assigned
    }

    const heroBlock = {
      portfolio_id: portfolioId,
      block_type: 'hero',
      position: 0,
      config: {
        headline: user.name || user.github_login || '개발자',
        subheadline,
        bio: user.github_bio || '',
        show_github_stats: true,
      },
      is_visible: true,
      is_ai_generated: true,
    }

    await updateProgress(30)

    // progress 50: project_grid, skills 블록 생성
    const eligibleProjects = user.raw_projects
      .filter((p) => !p.is_fork)
      .map((p) => ({ ...p, calculatedScore: calculateAiScore(p) }))
      .sort((a, b) => {
        if (a.calculatedScore !== b.calculatedScore) {
          return b.calculatedScore - a.calculatedScore
        }
        return (b.stargazers_count || 0) - (a.stargazers_count || 0)
      })
      .slice(0, 4)

    const projectGridBlock = {
      portfolio_id: portfolioId,
      block_type: 'project_grid',
      position: 1,
      config: {
        layout: 'grid',
        columns: 2,
        project_ids: eligibleProjects.map((p) => p.id),
        show_tech_stack: true,
      },
      is_visible: true,
      is_ai_generated: true,
    }

    const skills = sortedLangs.map(([name, count]) => ({
      name,
      level: Math.max(10, Math.round((count / (totalProjects || 1)) * 100)),
    }))

    const skillsBlock = {
      portfolio_id: portfolioId,
      block_type: 'skills',
      position: 2,
      config: {
        chart_type: 'radar',
        skills,
      },
      is_visible: true,
      is_ai_generated: true,
    }

    await updateProgress(50)

    // progress 70: contact, blog_feed 블록 생성
    const contactConfig: Record<string, string> = {
      github_url: `https://github.com/${user.github_login}`,
    }

    const missing_optional_fields = ['linkedin_url', 'website_url']

    if (user.email) {
      contactConfig.email = user.email
    } else {
      missing_optional_fields.push('email')
    }

    const contactBlock = {
      portfolio_id: portfolioId,
      block_type: 'contact',
      position: 3,
      config: contactConfig,
      is_visible: true,
      is_ai_generated: true,
    }

    const newBlocks: any[] = [heroBlock, projectGridBlock, skillsBlock, contactBlock]

    const blogIntegration = user.integrations.find((i) =>
      ['tistory', 'velog', 'medium'].includes(i.provider)
    )

    if (blogIntegration) {
      newBlocks.push({
        portfolio_id: portfolioId,
        block_type: 'blog_feed',
        position: 4,
        config: {
          integration_provider: blogIntegration.provider,
          max_items: 3,
          show_thumbnail: true,
        },
        is_visible: true,
        is_ai_generated: true,
      })
    }

    await updateProgress(70)

    // progress 85: portfolio_blocks DB 저장 완료
    await prisma.portfolioBlock.deleteMany({ where: { portfolio_id: portfolioId } })
    await prisma.portfolioBlock.createMany({
      data: newBlocks,
    })

    await updateProgress(85)

    // progress 95: is_published: true 저장 + revalidation
    let published_url: string | null = null
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
    })

    if (autoPublish && portfolio) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          is_published: true,
          auto_published: true,
          published_at: new Date(),
        },
      })
      published_url = `${env.NEXT_PUBLIC_APP_URL}/${portfolio.slug}`

      try {
        await fetch(`${env.NEXT_PUBLIC_APP_URL}/api/revalidate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: portfolio.slug }),
        })
      } catch (err) {
        console.error('Failed to trigger revalidate:', err)
      }
    }

    await updateProgress(95)

    // progress 100: status: 'completed'
    await updateProgress(100, {
      status: 'completed',
      published_url,
      missing_optional_fields,
    })
  } catch (error: any) {
    console.error('generatePortfolio process failed:', error)
    await updateProgress(0, {
      status: 'failed',
      error: error.message || String(error),
    })
  }
}
