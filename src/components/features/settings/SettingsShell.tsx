"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SettingsNav, type SettingsSection } from "./SettingsNav";
import { ProfileSection } from "./ProfileSection";
import { IntegrationsSection } from "./IntegrationsSection";

interface SettingsShellProps {
  initialSection: SettingsSection;
  githubConnected: boolean;
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
    githubLogin: string | null;
  };
}

export function SettingsShell({ initialSection, githubConnected, user }: SettingsShellProps) {
  const router = useRouter();
  const [active, setActive] = useState<SettingsSection>(initialSection);

  const handleChange = (section: SettingsSection) => {
    setActive(section);
    // 공유·새로고침 시에도 같은 탭이 열리도록 주소를 맞춰 둔다.
    router.replace(`/settings?section=${section}`, { scroll: false });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-[28px] font-bold tracking-tight text-white">설정</h1>
        <p className="text-[14px] text-spotify-silver font-medium">
          프로필과 연동 상태를 확인하고 관리해요.
        </p>
      </header>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        <SettingsNav activeSection={active} onSectionChange={handleChange} />
        <div className="flex-1 min-w-0">
          {active === "profile" ? (
            <ProfileSection user={user} />
          ) : (
            <IntegrationsSection githubConnected={githubConnected} />
          )}
        </div>
      </div>
    </div>
  );
}
