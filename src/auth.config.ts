import type { NextAuthConfig } from 'next-auth'
import GitHub from 'next-auth/providers/github'

export default {
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID!,
      clientSecret: process.env.AUTH_GITHUB_SECRET!,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email || `${profile.id}@users.noreply.github.com`,
          image: profile.avatar_url,
          github_login: profile.login,
          github_id: profile.id,
          github_bio: profile.bio ?? null,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
} satisfies NextAuthConfig
