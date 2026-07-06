import { prisma } from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { encrypt } from "@/lib/utils/security";


export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.github_login = user.github_login;
        token.github_bio_verified = user.github_bio_verified ?? false;
      } else if (token.id && !token.github_bio_verified) {
        // 세션 쿠키에는 false라고 되어있지만, 실제 DB에서 업데이트되었는지 실시간 확인
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { github_bio_verified: true },
        });
        if (dbUser?.github_bio_verified) {
          token.github_bio_verified = true;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.github_login = token.github_login ?? null;
        session.user.github_bio_verified = token.github_bio_verified ?? false;
      }
      return session;
    },
    async signIn() {
      return true;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.id && account.access_token) {
        await prisma.integration
          .upsert({
            where: {
              user_id_provider: {
                user_id: user.id,
                provider: "github",
              },
            },
            update: {
              access_token: encrypt(account.access_token),
              refresh_token: account.refresh_token as string | null,
            },
            create: {
              user_id: user.id,
              provider: "github",
              access_token: encrypt(account.access_token),
              refresh_token: account.refresh_token as string | null,
            },
          })
          .catch((err: unknown) =>
            console.error(
              "로그인 시 GitHub 연동 정보 동기화에 실패했습니다:",
              err,
            ),
          );
      }
    },
    async linkAccount({ user, account }) {
      if (account.provider === "github" && user.id && account.access_token) {
        await prisma.integration
          .upsert({
            where: {
              user_id_provider: {
                user_id: user.id,
                provider: "github",
              },
            },
            update: {
              access_token: encrypt(account.access_token),
              refresh_token: account.refresh_token as string | null,
            },
            create: {
              user_id: user.id,
              provider: "github",
              access_token: encrypt(account.access_token),
              refresh_token: account.refresh_token as string | null,
            },
          })
          .catch((err: unknown) =>
            console.error(
              "계정 연결 시 GitHub 연동 정보 동기화에 실패했습니다:",
              err,
            ),
          );
      }
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
});
