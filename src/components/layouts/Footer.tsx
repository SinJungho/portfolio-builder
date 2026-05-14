import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-spotify-near-black pt-20 pb-12 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* top area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12 md:gap-16 mb-16">
          {/* brand */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3 no-underline group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-spotify-green text-black shadow-spotify-md shrink-0">
                <Sparkles className="h-5 w-5 stroke-[2.5px]" />
              </div>
              <span className="text-[20px] font-bold text-white tracking-tight">
                PortfolioForge
              </span>
            </Link>

            <p className="text-[15px] leading-relaxed text-spotify-silver max-w-xs font-medium">
              개발자의 GitHub를 아름다운 포트폴리오로 자동 변환하는 AI 빌더. 전문성을 시각화하고 커리어 성장을 가속화하세요.
            </p>
          </div>

          {[
            { title: "제품", items: ["기능", "템플릿", "변경 로그"] },
            { title: "자료", items: ["문서", "API 참조", "블로그", "지원"] },
            {
              title: "회사",
              items: ["소개", "개인정보처리방침", "이용약관", "문의"],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[14px] font-bold text-white mb-6 uppercase tracking-spotify-wide">{col.title}</h4>

              <ul className="flex flex-col gap-4">
                {col.items.map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-[14px] text-spotify-silver no-underline transition-colors duration-200 hover:text-white font-medium"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom area */}
        <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-0">
          <span className="text-[13px] text-spotify-silver font-medium">
            © 2026 PortfolioForge. All rights reserved.
          </span>

          <div className="flex gap-3">
            {["GitHub", "Twitter", "LinkedIn"].map((s) => (
              <a
                key={s}
                href="#"
                className="px-5 py-2 rounded-full text-[13px] font-bold text-spotify-silver bg-white/5 border border-white/5 transition-all duration-200 hover:text-white hover:bg-white/10 no-underline uppercase tracking-spotify"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
