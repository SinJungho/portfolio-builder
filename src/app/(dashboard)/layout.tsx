import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/layouts/DashboardHeader";
import { Sidebar } from "@/components/layouts/Sidebar";

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

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9FA]">
      <Sidebar />
      <div className="flex flex-col flex-1 md:pl-64">
        <DashboardHeader />
        <main className="flex-1 pb-24 md:pb-0">{children}</main>
      </div>
    </div>
  );
}
