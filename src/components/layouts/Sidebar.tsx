"use client";

import { FolderOpen, Home, Settings, LogOut, ChevronRight, Menu, User, Bell, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "대시보드", href: "/dashboard" },
  { icon: FolderOpen, label: "프로젝트", href: "/projects" },
  { icon: Settings, label: "설정", href: "/settings" },
];

const LogoMark = () => (
  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3182F6] text-white shadow-[0_4px_12px_rgba(49,130,246,0.3)] shrink-0">
    <Sparkles className="h-5 w-5" />
  </div>
);

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user;
  
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-ink-100 flex-col z-50">
        {/* Logo */}
        <div className="h-16 flex items-center px-8 border-b border-ink-50">
          <Link href="/dashboard" className="flex items-center gap-2 group no-underline">
            <LogoMark />
            <span className="text-ink-900 font-bold text-[18px] tracking-tight">PortfolioForge</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-8 px-4">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group no-underline",
                      isActive
                        ? "bg-blue-600 text-white shadow-[0_8px_16px_rgba(49,130,246,0.15)]"
                        : "text-ink-500 hover:bg-ink-50 hover:text-ink-900 font-medium"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-ink-300 group-hover:text-ink-900 transition-colors")} />
                      <span className="text-[15px]">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-4 h-4 text-white/60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-ink-50">
          <div className="bg-ink-50 rounded-2xl p-3 flex items-center gap-3 border border-ink-100/50">
            <div className="w-10 h-10 rounded-xl bg-white border border-ink-100 overflow-hidden shrink-0 flex items-center justify-center">
               {user?.image ? (
                <img src={user.image} alt="" className="w-full h-full object-cover" />
              ) : (
                <User size={20} className="text-ink-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-bold text-ink-900 truncate">{user?.name || "사용자"}</div>
              <div className="text-[11px] font-medium text-ink-400 truncate">{user?.email}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-ink-100 px-6 flex items-center justify-between z-50 safe-area-inset-bottom shadow-[0_-4px_16px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.label}
              href={item.href} 
              className={cn(
                "flex flex-col items-center gap-1 min-w-[64px] transition-all no-underline",
                isActive ? "text-blue-600" : "text-ink-300"
              )}
            >
              <div className={cn("p-1 rounded-xl transition-all", isActive ? "bg-blue-50" : "")}>
                <Icon className={cn("w-[22px] h-[22px]", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
              </div>
              <span className={cn("text-[10px] font-bold", isActive ? "opacity-100" : "opacity-60")}>{item.label}</span>
            </Link>
          );
        })}
        
        {/* Mobile More / Sheet */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center gap-1 min-w-[64px] text-ink-300 outline-none">
              <div className="p-1 rounded-xl">
                <Menu className="w-[22px] h-[22px] stroke-[2px]" />
              </div>
              <span className="text-[10px] font-bold opacity-60">더보기</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-[32px] px-0 pb-12 pt-4 border-none shadow-2xl">
            <div className="mx-auto w-12 h-1.5 bg-ink-100 rounded-full mb-6" />
            <div className="px-6 mb-8 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white border border-ink-200 overflow-hidden flex items-center justify-center">
                 {user?.image ? (
                  <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={28} className="text-ink-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[18px] text-ink-900 leading-tight">{user?.name || "사용자"}</p>
                <p className="text-[14px] text-ink-500 truncate">{user?.email}</p>
              </div>
            </div>
            
            <div className="px-3 space-y-1">
              <Link 
                href="/settings" 
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-ink-50 transition-all font-bold text-ink-700 group no-underline"
              >
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-ink-300 group-hover:text-blue-600" />
                  <span>사용 설정</span>
                </div>
                <ChevronRight size={18} className="text-ink-200" />
              </Link>
              
              <button 
                onClick={() => signOut()}
                className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 transition-all font-bold text-ink-700 group"
              >
                <div className="flex items-center gap-3">
                  <LogOut size={20} className="text-ink-300 group-hover:text-red-500" />
                  <span className="group-hover:text-red-500">로그아웃</span>
                </div>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
