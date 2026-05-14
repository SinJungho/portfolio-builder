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
    <nav className="w-full lg:w-64 bg-spotify-dark-surface rounded-3xl p-4 shadow-spotify-md h-fit border border-white/5">
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => onSectionChange(section.id)}
              className={`w-full text-left px-5 py-3 rounded-full text-[14px] font-bold uppercase tracking-spotify transition-all ${
                activeSection === section.id
                  ? "bg-spotify-green text-black"
                  : section.id === "danger"
                  ? "text-spotify-negative hover:bg-spotify-negative/10"
                  : "text-spotify-silver hover:bg-white/5 hover:text-white"
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
