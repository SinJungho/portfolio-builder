import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { SettingsShell } from "@/components/features/settings/SettingsShell";
import type { SettingsSection } from "@/components/features/settings/SettingsNav";
import { prisma } from "@/lib/prisma";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { section } = await searchParams;
  const initialSection: SettingsSection =
    section === "integrations" ? "integrations" : "profile";
  const [integration, account] = await Promise.all([
    prisma.integration.findUnique({
      where: { user_id_provider: { user_id: session.user.id, provider: "github" } },
      select: { access_token: true, is_active: true },
    }),
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { access_token: true },
    }),
  ]);

  return (
    <div className="min-h-[100dvh] bg-spotify-near-black">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <SettingsShell
          initialSection={initialSection}
          githubConnected={Boolean((integration?.is_active ?? true) && (integration?.access_token || account?.access_token))}
          user={{
            name: session.user.name ?? null,
            email: session.user.email ?? null,
            image: session.user.image ?? null,
            githubLogin: session.user.github_login ?? null,
          }}
        />
      </div>
    </div>
  );
}
