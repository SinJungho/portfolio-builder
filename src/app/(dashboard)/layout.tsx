import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (!(session.user as any).github_bio_verified) {
    redirect("/onboarding/bio");
  }

  return <div className="flex min-h-screen flex-col">{children}</div>;
}
