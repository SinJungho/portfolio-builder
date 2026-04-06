"use client";

import { Github, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-10 px-6 text-gray-400">
      <div className="max-w-280 mx-auto">
        {/* top area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-12">
          {/* brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7.5 h-7.5 rounded-lg bg-[linear-gradient(135deg,#3182F6,#8B5CF6)]" />
              <span className="text-[16px] font-bold text-white">
                포트폴리오포지
              </span>
            </div>

            <p className="text-sm leading-[1.7] text-slate-500">
              개발자의 GitHub를 아름다운 포트폴리오로 자동 변환하는 AI 빌더
            </p>
          </div>

          {[
            {
              title: "제품",
              items: [
                { name: "기능", href: "/features" },
                { name: "템플릿", href: "/templates" },
                { name: "변경 로그", href: "/changelog" },
              ],
            },
            {
              title: "자료",
              items: [
                { name: "문서", href: "/docs" },
                { name: "API 참조", href: "/api" },
                { name: "블로그", href: "/blog" },
                { name: "지원", href: "/support" },
              ],
            },
            {
              title: "회사",
              items: [
                { name: "소개", href: "/about" },
                { name: "개인정보처리방침", href: "/privacy" },
                { name: "이용약관", href: "/terms" },
                { name: "문의", href: "/contact" },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-bold text-white mb-4">{col.title}</h4>

              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-slate-500 no-underline transition-colors duration-200 hover:text-white"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* bottom area */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0">
          <span className="text-[13px] text-gray-400">
            © 2026 포트폴리오포지. 모든 권리 보유.
          </span>

          <div className="flex gap-2">
            {[
              {
                name: "GitHub",
                icon: <Github size={16} />,
                href: "https://github.com",
              },
              {
                name: "Twitter",
                icon: <Twitter size={16} />,
                href: "https://twitter.com",
              },
              {
                name: "LinkedIn",
                icon: <Linkedin size={16} />,
                href: "https://linkedin.com",
              },
            ].map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] text-slate-500 bg-white/4 border border-slate-800 transition-colors duration-200 hover:text-white"
              >
                {s.icon}
                {s.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
