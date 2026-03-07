import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import authConfig from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.github_login = (user as any).github_login
        token.plan = (user as any).plan ?? 'free'
        token.github_bio_verified = (user as any).github_bio_verified ?? false
      } else if (token.id && !token.github_bio_verified) {
        // 세션 쿠키에는 false라고 되어있지만, 실제 DB에서 업데이트되었는지 실시간 확인
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { github_bio_verified: true }
        })
        if (dbUser?.github_bio_verified) {
          token.github_bio_verified = true
        }
      }
      return token
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.github_login = token.github_login
        session.user.plan = token.plan
        session.user.github_bio_verified = token.github_bio_verified
      }
      return session
    },
    async signIn({ user, profile, account }) {
      return true
    },
  },
  events: {
    async linkAccount({ user, account }) {
      if (account.provider === 'github' && user.id && account.access_token) {
        await prisma.integration.upsert({
          where: {
            user_id_provider: {
              user_id: user.id,
              provider: 'github',
            },
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token as string | null,
          },
          create: {
            user_id: user.id,
            provider: 'github',
            access_token: account.access_token,
            refresh_token: account.refresh_token as string | null,
          },
        }).catch((err) => console.error('Failed to sync GitHub integration on linkAccount:', err))
      }
    }
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET,
})
