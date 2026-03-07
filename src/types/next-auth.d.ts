import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      github_login: string | null
      plan: string
      github_bio_verified: boolean
    } & DefaultSession['user']
  }
}
