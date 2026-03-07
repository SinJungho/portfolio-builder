import { prisma } from '@/lib/prisma'
import { redis, JOB_KEY, type JobStatus } from '@/lib/redis'
import { fetchUserRepos, fetchRepoReadme, type GithubRepo } from '@/lib/github'

export interface SyncJobStatus extends JobStatus {
  synced_count: number
}

export async function syncGithubData({
  jobId,
  userId,
  force = false,
}: {
  jobId: string
  userId: string
  force?: boolean
}): Promise<void> {
  const updateProgress = async (progress: number, updates: Partial<SyncJobStatus> = {}) => {
    try {
      const key = JOB_KEY(jobId)
      const cached = await redis.get(key)
      let current: SyncJobStatus = cached
        ? typeof cached === 'string' ? JSON.parse(cached) : (cached as SyncJobStatus)
        : {
            status: 'pending',
            progress: 0,
            portfolio_id: '',
            user_id: userId,
            auto_publish: false,
            synced_count: 0,
          }

      current = { ...current, ...updates, progress }
      await redis.set(key, JSON.stringify(current), { ex: 600 })
    } catch (err) {
      console.error(`Failed to update sync progress for job ${jobId}:`, err)
    }
  }

  try {
    await updateProgress(0, { status: 'processing' })

    const integration = await prisma.integration.findUnique({
      where: { user_id_provider: { user_id: userId, provider: 'github' } },
    })

    if (!integration || !integration.access_token) {
      throw new Error('Integration not found or missing access token')
    }

    // 1. Fetch repositories
    await updateProgress(10)
    const repos = await fetchUserRepos(integration.access_token)
    await updateProgress(30, { synced_count: 0 })

    const total = repos.length
    let synced = 0

    // 2. Process each repo
    for (const repo of repos) {
      try {
        // README fetch - heavy operation, could be optimized
        const existing = await prisma.rawProject.findUnique({
          where: {
            user_id_source_external_id: {
              user_id: userId,
              source: 'github',
              external_id: String(repo.id),
            },
          },
          select: { raw_data: true, id: true },
        })

        const rawData = (existing?.raw_data as any) || {}
        let readme = rawData.readme || ''

        // Cache hit if not forced and readme already exists
        if (force || !readme) {
          const owner = repo.full_name.split('/')[0]
          readme = await fetchRepoReadme(integration.access_token, owner, repo.name)
        }

        const fullRawData = {
          ...repo,
          readme: readme,
        }

        await prisma.rawProject.upsert({
          where: {
            user_id_source_external_id: {
              user_id: userId,
              source: 'github',
              external_id: String(repo.id),
            },
          },
          update: {
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            topics: repo.topics,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            is_fork: repo.fork,
            pushed_at: repo.pushed_at ? new Date(repo.pushed_at) : null,
            raw_data: fullRawData,
          },
          create: {
            user_id: userId,
            source: 'github',
            external_id: String(repo.id),
            name: repo.name,
            description: repo.description,
            html_url: repo.html_url,
            language: repo.language,
            topics: repo.topics,
            stargazers_count: repo.stargazers_count,
            forks_count: repo.forks_count,
            is_fork: repo.fork,
            pushed_at: repo.pushed_at ? new Date(repo.pushed_at) : null,
            raw_data: fullRawData,
          },
        })

        synced++
        const progress = 30 + Math.floor((synced / total) * 60) // 30% -> 90%
        await updateProgress(progress, { synced_count: synced })
      } catch (repoErr) {
        console.error(`Failed to sync repo ${repo.full_name}:`, repoErr)
      }
    }

    await prisma.integration.update({
      where: { id: integration.id },
      data: { synced_at: new Date() },
    })

    await updateProgress(100, { status: 'completed' })
  } catch (error: any) {
    console.error('syncGithubData process failed:', error)
    await updateProgress(0, {
      status: 'failed',
      error: error.message || String(error),
    })
  }
}
