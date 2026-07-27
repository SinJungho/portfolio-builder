"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  ChevronRight,
  Home,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { LanguageSwitcher } from "../common/LanguageSwitcher";

const navItems = [
  { icon: Home, label: "대시보드", href: "/dashboard" },
  { icon: BarChart3, label: "분석", href: "/analytics" },
  { icon: Settings, label: "설정", href: "/settings" },
];

const LogoMark = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black shadow-[0_4px_12px_rgba(30,215,96,0.3)] shrink-0">
    <Sparkles className="h-5 w-5 stroke-[2.5px]" />
  </div>
);

export function Sidebar({ user }: { user?: { name?: string | null; email?: string | null; image?: string | null } }) {
  const pathname = usePathname();
  const isEditor = pathname.startsWith("/editor/");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("fixed left-0 top-0 h-screen w-64 bg-spotify-near-black flex-col z-50", isEditor ? "hidden" : "hidden md:flex")}>
        {/* Logo */}
        <div className="h-20 flex items-center px-8">
          <Link href="/" className="flex items-center gap-3 group no-underline">
            <LogoMark />
            <span className="text-white font-bold text-[20px] tracking-tight">
              PortfolioForge
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-4 px-4 py-3 rounded-md transition-all duration-300 group no-underline",
                      isActive
                        ? "text-white"
                        : "text-spotify-silver hover:text-white",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-6 h-6 transition-colors",
                        isActive ? "text-white" : "text-spotify-silver group-hover:text-white",
                      )}
                    />
                    <span className={cn("text-[14px]", isActive ? "font-bold" : "font-semibold")}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 space-y-4">
          <div className="px-4">
             <LanguageSwitcher />
          </div>
          <div className="bg-spotify-mid-dark rounded-xl p-3 flex items-center gap-3 shadow-spotify-md">
            <div className="w-10 h-10 rounded-full bg-spotify-dark-surface overflow-hidden shrink-0 flex items-center justify-center border border-white/5">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={20} className="text-spotify-silver" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-white truncate">
                {user?.name || "사용자"}
              </div>
              <div className="text-[11px] font-medium text-spotify-silver truncate">
                {user?.email}
              </div>
            </div>
            <button 
              onClick={() => signOut()}
              className="p-1.5 text-spotify-silver hover:text-white transition-colors"
              aria-label="로그아웃"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className={cn("md:hidden fixed bottom-0 left-0 right-0 h-16 bg-black/80 backdrop-blur-xl border-t border-white/5 px-6 items-center justify-between z-50 safe-area-inset-bottom", isEditor ? "hidden" : "flex")}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all no-underline",
                isActive ? "text-white" : "text-spotify-silver",
              )}
            >
              <Icon
                className={cn(
                  "w-[22px] h-[22px]",
                  isActive ? "stroke-[2.5px]" : "stroke-[2px]",
                )}
              />
              <span
                className={cn(
                  "text-[10px] font-bold",
                  isActive ? "opacity-100" : "opacity-60",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Mobile More / Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 min-w-[64px] text-spotify-silver outline-none">
              <Menu className="w-[22px] h-[22px] stroke-[2px]" />
              <span className="text-[10px] font-bold opacity-60">더보기</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="bottom"
            className="bg-spotify-dark-surface border-none rounded-t-[32px] px-0 pb-12 pt-4 shadow-spotify"
          >
            <div className="mx-auto w-12 h-1.5 bg-white/10 rounded-full mb-6" />
            <div className="px-6 mb-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-spotify-mid-dark border border-white/5 overflow-hidden flex items-center justify-center">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt=""
                    width={56}
                    height={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={28} className="text-spotify-silver" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[18px] text-white leading-tight">
                  {user?.name || "사용자"}
                </p>
                <p className="text-[14px] text-spotify-silver truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="px-3 space-y-1">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all font-bold text-white group no-underline"
              >
                <div className="flex items-center gap-3">
                  <Settings
                    size={20}
                    className="text-spotify-silver group-hover:text-white"
                  />
                  <span>설정</span>
                </div>
                <ChevronRight size={18} className="text-white/20" />
              </Link>

              <button
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-spotify-negative/10 transition-all font-bold text-white group"
              >
                <div className="flex items-center gap-3">
                  <LogOut
                    size={20}
                    className="text-spotify-silver group-hover:text-spotify-negative"
                  />
                  <span className="group-hover:text-spotify-negative">로그아웃</span>
                </div>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
