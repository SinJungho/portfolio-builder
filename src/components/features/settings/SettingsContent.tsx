import { AccountSection } from "./AccountSection";
import { DangerZoneSection } from "./DangerZoneSection";
import { IntegrationsSection } from "./IntegrationsSection";
import { ProfileSection } from "./ProfileSection";

interface SettingsContentProps {
  activeSection: "profile" | "account" | "integrations" | "billing" | "danger";
}

export function SettingsContent({ activeSection }: SettingsContentProps) {
  return (
    <div className="flex-1 p-8 max-w-[800px]">
      {activeSection === "profile" && <ProfileSection />}
      {activeSection === "account" && <AccountSection />}
      {activeSection === "integrations" && <IntegrationsSection />}
      {activeSection === "billing" && (
        <div>
          <h2 className="text-gray-900 mb-6">Billing</h2>
          <p className="text-gray-600">Billing settings coming soon...</p>
        </div>
      )}
      {activeSection === "danger" && <DangerZoneSection />}
    </div>
  );
}
