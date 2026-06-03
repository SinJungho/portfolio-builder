import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      github_login: string | null;
      github_bio_verified: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    github_login?: string | null;
    github_bio_verified?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    github_login?: string | null;
    github_bio_verified?: boolean;
  }
}
