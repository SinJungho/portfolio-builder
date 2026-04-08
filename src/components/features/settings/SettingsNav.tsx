interface SettingsNavProps {
  activeSection: "profile" | "account" | "integrations" | "danger";
  onSectionChange: (
    section: "profile" | "account" | "integrations" | "danger"
  ) => void;
}

export function SettingsNav({
  activeSection,
  onSectionChange,
}: SettingsNavProps) {
  const sections = [
    { id: "profile" as const, label: "Profile" },
    { id: "account" as const, label: "Account" },
    { id: "integrations" as const, label: "Integrations" },
    { id: "danger" as const, label: "Danger Zone" },
  ];

  return (
    <nav className="w-[200px] border-r border-gray-200 bg-white py-6 px-3">
      <ul className="space-y-1">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                activeSection === section.id
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
