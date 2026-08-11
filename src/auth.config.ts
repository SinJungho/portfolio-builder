import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

function oauthEnv(name: "AUTH_GITHUB_ID" | "AUTH_GITHUB_SECRET") {
  const value = process.env[name];
  if (!value || value === "[SENSITIVE]") {
    throw new Error(`${name} must contain the GitHub OAuth App value`);
  }
  return value;
}

export default {
  providers: [
    GitHub({
      clientId: oauthEnv("AUTH_GITHUB_ID"),
      clientSecret: oauthEnv("AUTH_GITHUB_SECRET"),
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email: profile.email || `${profile.id}@users.noreply.github.com`,
          image: profile.avatar_url,
          github_login: profile.login,
          github_id: profile.id,
          github_bio: profile.bio ?? null,
          github_bio_verified: false,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
} satisfies NextAuthConfig;
