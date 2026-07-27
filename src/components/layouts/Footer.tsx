import { Sparkles } from "lucide-react";
import Link from "next/link";
import { LinkedInIcon, XIcon } from "@/components/icons";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.51 11.51 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.014 2.898-.014 3.293 0 .322.216.694.825.576C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

const sitemap = [
  {
    title: "제품",
    links: [
      { label: "기능", href: "#" },
      { label: "템플릿", href: "#" },
      { label: "변경 로그", href: "#" },
    ],
  },
  {
    title: "자료",
    links: [
      { label: "문서", href: "#" },
      { label: "블로그", href: "#" },
      { label: "지원", href: "#" },
    ],
  },
  {
    title: "회사",
    links: [
      { label: "소개", href: "#" },
      { label: "문의", href: "#" },
    ],
  },
] as const;

const socials = [
  { label: "GitHub", href: "#", Icon: GitHubIcon },
  { label: "X", href: "#", Icon: XIcon },
  { label: "LinkedIn", href: "#", Icon: LinkedInIcon },
] as const;

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-spotify-near-black border-t border-white/5">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* Editorial top: brand takes the lead, sitemap tucks to the side */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-3 no-underline"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black shadow-spotify-md shrink-0">
                <Sparkles className="h-5 w-5 stroke-[2.5px]" aria-hidden="true" />
              </span>
              <span className="text-[20px] font-bold text-white tracking-tight">
                PortfolioForge
              </span>
            </Link>

            <p className="mt-6 text-[15px] leading-relaxed text-spotify-silver font-medium">
              GitHub 활동을 채용 담당자가 읽기 좋은 포트폴리오로 만들어요.
              한 번 연결하면 커밋할 때마다 알아서 최신으로 유지돼요.
            </p>

            {/* Real brand marks, not uppercase text chips */}
            <div className="mt-7 flex items-center gap-2.5">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/4 text-spotify-silver transition-all duration-200 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spotify-green focus-visible:ring-offset-2 focus-visible:ring-offset-spotify-near-black no-underline"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Sitemap — sentence-case, quiet headings (no uppercase eyebrow) */}
          {sitemap.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h4 className="text-[13px] font-semibold text-white mb-5">
                {col.title}
              </h4>
              <ul className="flex flex-col gap-3.5">
                {col.links.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group inline-flex items-center text-[14px] text-spotify-silver no-underline transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:text-white"
                    >
                      <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">
                        {item.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar: copyright left, legal where people expect it — right */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-spotify-silver font-medium">
            © 2026 PortfolioForge — 취업 준비하는 개발자를 위해 만들었어요.
          </span>

          <div className="flex items-center gap-6">
            <Link
              href="#"
              className="text-[13px] font-medium text-spotify-silver no-underline transition-colors duration-200 hover:text-white"
            >
              개인정보처리방침
            </Link>
            <Link
              href="#"
              className="text-[13px] font-medium text-spotify-silver no-underline transition-colors duration-200 hover:text-white"
            >
              이용약관
            </Link>
          </div>
        </div>
      </div>

      {/* Oversized wordmark sign-off — a quiet watermark that bleeds off the base */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/2 z-0 block -translate-x-1/2 select-none whitespace-nowrap text-[22vw] font-black leading-none tracking-tighter text-white/[0.035] sm:-bottom-10"
      >
        PortfolioForge
      </span>
    </footer>
  );
}
