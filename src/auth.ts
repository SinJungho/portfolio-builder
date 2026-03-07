import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import authConfig from './auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    session({ session, user }: any) {
      if (user) {
        session.user.id = user.id
        session.user.github_login = user.github_login
        session.user.plan = user.plan ?? 'free'
        session.user.github_bio_verified = user.github_bio_verified ?? false
      }
      return session
    },
    async signIn({ user, profile }) {
      if (profile?.bio !== undefined && user.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { github_bio: (profile as any).bio ?? null },
        }).catch(() => {})
      }
      return true
    },
  },
  session: {
    strategy: 'database',
  },
})
