import { AccountSection } from "./AccountSection";
import { DangerZoneSection } from "./DangerZoneSection";
import { IntegrationsSection } from "./IntegrationsSection";
import { ProfileSection } from "./ProfileSection";

interface SettingsContentProps {
  activeSection: "profile" | "account" | "integrations" | "danger";
}

export function SettingsContent({ activeSection }: SettingsContentProps) {
  return (
    <div className="flex-1 p-8 max-w-[800px]">
      {activeSection === "profile" && <ProfileSection />}
      {activeSection === "account" && <AccountSection />}
      {activeSection === "integrations" && <IntegrationsSection />}
      {activeSection === "danger" && <DangerZoneSection />}
    </div>
  );
}
