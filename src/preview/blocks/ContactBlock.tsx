"use client";

import React from "react";
import { Github, Mail, Linkedin, Globe, ArrowUpRight } from "lucide-react";
import type { ThemeTokens } from "../themes";

interface ContactBlockProps {
  config: {
    github_url?: string;
    email?: string;
    linkedin_url?: string;
    website_url?: string;
  };
  theme: ThemeTokens;
  portfolioId?: string;
  blockId?: string;
}

export default function ContactBlock({ config, theme: t, portfolioId, blockId }: ContactBlockProps) {
  const { github_url, email, linkedin_url, website_url } = config;

  const handleContactClick = async (type: string) => {
    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          event_type: "block_click", 
          portfolio_id: portfolioId,
          block_id: blockId 
        }),
      });
    } catch (error) {
      console.error(`Failed to send analytics event for ${type}:`, error);
    }
  };

  const socialLinks = [
    github_url && { href: github_url, icon: Github, label: "GitHub", type: "github" },
    linkedin_url && { href: linkedin_url, icon: Linkedin, label: "LinkedIn", type: "linkedin" },
    website_url && { href: website_url, icon: Globe, label: "웹사이트", type: "website" },
  ].filter(Boolean) as Array<{ href: string; icon: React.ElementType; label: string; type: string }>;

  if (!email && socialLinks.length === 0) return null;

  return (
    <section
      id="contact"
      className="relative overflow-hidden -mx-6 md:-mx-8 px-6 md:px-8"
    >
      <div
        className="relative py-16 md:py-24 px-8 md:px-12 flex flex-col items-center text-center"
        style={{ borderRadius: t.cardRadius }}
      >
        {/* 연락처 카드 배경을 표시한다. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: t.surfaceBg, borderRadius: t.cardRadius, border: `1px solid ${t.cardBorder}` }}
        />

        <div className="relative z-10 max-w-xl space-y-8">
          <div className="space-y-5">
            <h2
              className="text-[36px] md:text-[48px] font-extrabold tracking-[-1px] leading-[1.05]"
              style={{ color: t.text }}
            >
              함께 좋은 결과를
              <br />
              만들어가요.
            </h2>
            <p
              className="text-[17px] leading-relaxed"
              style={{ color: t.textMuted }}
            >
              프로젝트 또는 채용 관련 문의를 남겨 주세요.
            </p>
          </div>

          {/* 이메일 문의 링크를 표시한다. */}
          {email && (
            <div>
              <a
                href={`mailto:${email}`}
                onClick={() => handleContactClick("email")}
                className="group inline-flex items-center gap-3 px-8 py-4.5 text-[16px] font-bold rounded-full transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4"
                style={{
                  backgroundColor: t.ctaBg,
                  color: t.ctaText,
                  outlineColor: t.accent,
                }}
              >
                <Mail className="w-[18px] h-[18px]" />
                이메일로 문의하기
                <ArrowUpRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </a>

              <p
                className="mt-4 text-[14px] font-medium break-all"
                style={{ color: t.textMuted }}
              >
                {email}
              </p>
            </div>
          )}

          {/* 외부 연락처 링크를 표시한다. */}
          {socialLinks.length > 0 && (
            <div className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.type}
                  href={link.href}
                  onClick={() => handleContactClick(link.type)}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 px-5 py-3 text-[14px] font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:brightness-[1.12] focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    color: t.text,
                    outlineColor: t.accent,
                  }}
                >
                  <link.icon className="w-[18px] h-[18px]" style={{ color: t.textMuted }} />
                  {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
