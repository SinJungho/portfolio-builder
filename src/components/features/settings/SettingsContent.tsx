import { AccountSection } from "./AccountSection";
import { DangerZoneSection } from "./DangerZoneSection";
import { DomainsSection } from "./DomainsSection";
import { IntegrationsSection } from "./IntegrationsSection";
import { ProfileSection } from "./ProfileSection";

interface SettingsContentProps {
  activeSection: "profile" | "account" | "integrations" | "domains" | "danger";
}

export function SettingsContent({ activeSection }: SettingsContentProps) {
  return (
    <div className="flex-1 p-8 max-w-[800px]">
      {activeSection === "profile" && <ProfileSection />}
      {activeSection === "account" && <AccountSection />}
      {activeSection === "integrations" && <IntegrationsSection />}
      {activeSection === "domains" && <DomainsSection />}
      {activeSection === "danger" && <DangerZoneSection />}
    </div>
  );
}
