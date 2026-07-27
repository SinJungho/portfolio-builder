export type SettingsSection = "profile" | "integrations";

interface SettingsNavProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export function SettingsNav({ activeSection, onSectionChange }: SettingsNavProps) {
  const sections: { id: SettingsSection; label: string }[] = [
    { id: "profile", label: "프로필" },
    { id: "integrations", label: "연동" },
  ];

  return (
    <nav
      aria-label="설정 메뉴"
      className="w-full lg:w-56 bg-spotify-dark-surface rounded-3xl p-4 shadow-spotify-md h-fit border border-white/5"
    >
      <ul className="flex gap-2 lg:flex-col">
        {sections.map((section) => (
          <li key={section.id} className="flex-1 lg:flex-none">
            <button
              type="button"
              onClick={() => onSectionChange(section.id)}
              aria-current={activeSection === section.id ? "page" : undefined}
              className={`w-full text-left px-5 py-3 rounded-full text-[14px] font-bold transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spotify-green ${
                activeSection === section.id
                  ? "bg-spotify-green text-black"
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
