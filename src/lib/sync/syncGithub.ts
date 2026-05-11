import { prisma } from '@/lib/prisma'
import { redis, JOB_KEY, type JobStatus } from '@/lib/redis'
import { fetchUserRepos, fetchRepoReadme } from '@/lib/github'

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

    let accessToken = integration?.access_token

    // Fallback: If not in Integration table, try to get from Account table (NextAuth)
    if (!accessToken) {
      const account = await prisma.account.findFirst({
        where: { userId, provider: 'github' },
      })
      accessToken = account?.access_token
    }

    if (!accessToken) {
      throw new Error('GitHub access token not found. Please try logging out and in again.')
    }

    // 1. Fetch repositories
    await updateProgress(10)
    const repos = await fetchUserRepos(accessToken)
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawData = (existing?.raw_data as any) || {}
        let readme = rawData.readme || ''

        // Cache hit if not forced and readme already exists
        if (force || !readme) {
          const owner = repo.full_name.split('/')[0]
          readme = await fetchRepoReadme(accessToken, owner, repo.name)
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

    await prisma.integration.upsert({
      where: { user_id_provider: { user_id: userId, provider: 'github' } },
      update: { synced_at: new Date() },
      create: {
        user_id: userId,
        provider: 'github',
        access_token: accessToken,
        synced_at: new Date(),
      },
    })

    await updateProgress(100, { status: 'completed' })
  } catch (error: unknown) {
    console.error('syncGithubData process failed:', error)
    
    let friendlyMessage = (error as Error).message || String(error);
    if (friendlyMessage.includes("Bad credentials")) {
      friendlyMessage = "GitHub 인증 세션이 만료되었습니다. 다시 로그인해 주세요.";
    }

    await updateProgress(0, {
      status: 'failed',
      error: friendlyMessage,
    })
  }
}
