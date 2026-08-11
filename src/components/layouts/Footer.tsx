import { Sparkles } from "lucide-react";
import Link from "next/link";

// 목적지가 없는 항목은 싣지 않는다. 라벨만 있고 `#`를 가리키는 링크는
// 정보가 아니라 소음이고, 누르면 사용자가 자기 위치를 잃는다.
// 열이 하나뿐이면 제목이 하는 일이 없다. /features를 지우면서 "제품" 열이 한 항목만
// 남아 "시작하기"와 합쳤다.
const sitemap = [
  {
    title: "바로가기",
    links: [
      { label: "템플릿", href: "/templates" },
      { label: "포트폴리오 만들기", href: "/dashboard" },
      { label: "대시보드", href: "/dashboard" },
    ],
  },
] as const;

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-spotify-near-black border-t border-white/5">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-10">
        {/* Editorial top: brand takes the lead, sitemap tucks to the side */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-14 md:grid-cols-[1.8fr_1fr]">
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

          </div>

          {/* Sitemap: sentence-case, quiet headings (no uppercase eyebrow) */}
          {sitemap.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[13px] font-semibold text-white mb-5">
                {col.title}
              </h2>
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

        {/* Bottom bar: copyright left, legal where people expect it on the right */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/5 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[13px] text-spotify-silver font-medium">
            © 2026 PortfolioForge · 취업 준비하는 개발자를 위해 만들었어요.
          </span>

          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-[13px] font-medium text-spotify-silver no-underline transition-colors duration-200 hover:text-white"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="text-[13px] font-medium text-spotify-silver no-underline transition-colors duration-200 hover:text-white"
            >
              이용약관
            </Link>
          </div>
        </div>
      </div>

      {/* Oversized wordmark sign-off: a quiet watermark that bleeds off the base */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-6 left-1/2 z-0 block -translate-x-1/2 select-none whitespace-nowrap text-[22vw] font-black leading-none tracking-tighter text-white/[0.035] sm:-bottom-10"
      >
        PortfolioForge
      </span>
    </footer>
  );
}
