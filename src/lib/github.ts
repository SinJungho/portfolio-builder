export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  stargazers_count: number
  forks_count: number
  language: string | null
  fork: boolean
  pushed_at: string
  topics: string[]
}

export async function fetchUserRepos(accessToken: string): Promise<GithubRepo[]> {
  const allRepos: GithubRepo[] = []
  let page = 1
  const perPage = 100

  while (true) {
    const res = await fetch(`https://api.github.com/user/repos?per_page=${perPage}&page=${page}&sort=pushed&direction=desc`, {
      headers: {
        Authorization: `token ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
        'User-Agent': 'PortfolioForge-App',
      },
    })

    if (!res.ok) {
      const error = await res.json()
      throw new Error(`GitHub API Error: ${error.message || res.statusText}`)
    }

    const repos: GithubRepo[] = await res.json()
    if (repos.length === 0) break

    allRepos.push(...repos)
    if (repos.length < perPage) break
    page++
  }

  return allRepos
}

export async function fetchRepoReadme(accessToken: string, owner: string, repo: string): Promise<string> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: 'application/vnd.github.v3.raw',
      'User-Agent': 'PortfolioForge-App',
    },
  })

  if (res.status === 404) return ''
  if (!res.ok) return ''

  return await res.text()
}
