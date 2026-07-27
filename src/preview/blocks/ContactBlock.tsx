"use client";

import React from "react";
import { Github, Mail, Linkedin, Globe, ArrowUpRight } from "lucide-react";
import type { ThemeTokens } from "../themes";
import { useScrollReveal } from "../hooks/useScrollReveal";

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

  const { ref: headingRef, style: headingStyle } = useScrollReveal("fadeUp");
  const { ref: ctaRef, style: ctaStyle } = useScrollReveal("fadeUp");
  const { ref: linksRef, style: linksStyle } = useScrollReveal("fadeUp");

  const socialLinks = [
    github_url && { href: github_url, icon: Github, label: "GitHub", type: "github" },
    linkedin_url && { href: linkedin_url, icon: Linkedin, label: "LinkedIn", type: "linkedin" },
    website_url && { href: website_url, icon: Globe, label: "Website", type: "website" },
  ].filter(Boolean) as Array<{ href: string; icon: React.ElementType; label: string; type: string }>;

  return (
    <section
      className="relative overflow-hidden -mx-6 md:-mx-8 px-6 md:px-8"
    >
      <div
        className="relative py-24 md:py-32 px-8 md:px-12 flex flex-col items-center text-center"
        style={{ borderRadius: t.cardRadius }}
      >
        {/* ── Gradient Mesh Background ── */}
        <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: t.cardRadius, overflow: "hidden" }}>
          <div
            className="absolute inset-0"
            style={{ backgroundColor: t.surfaceBg }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[120px] opacity-40"
            style={{ backgroundColor: t.accent, top: "-10%", left: "-5%" }}
          />
          <div
            className="absolute w-[350px] h-[350px] rounded-full blur-[100px] opacity-25"
            style={{ backgroundColor: t.accent, bottom: "-15%", right: "0%" }}
          />
          <div
            className="absolute w-[250px] h-[250px] rounded-full blur-[80px] opacity-20"
            style={{ backgroundColor: t.glowColor, top: "30%", right: "20%" }}
          />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 max-w-xl space-y-8">
          {/* Heading */}
          <div ref={headingRef} style={headingStyle} className="space-y-5">
            <h2
              className="text-[36px] md:text-[48px] font-extrabold tracking-[-2.5px] leading-[1.05]"
              style={{ color: t.text }}
            >
              함께 좋은 결과를
              <br />
              <span
                style={{
                  background: t.accentGradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                만들어가요.
              </span>
            </h2>
            <p
              className="text-[17px] leading-relaxed"
              style={{ color: t.textMuted }}
            >
              새로운 기회와 협업에 언제나 열려 있습니다.
              <br />
              편하신 방법으로 연락해 주세요.
            </p>
          </div>

          {/* Email CTA */}
          {email && (
            <div ref={ctaRef} style={ctaStyle}>
              <a
                href={`mailto:${email}`}
                onClick={() => handleContactClick("email")}
                className="group inline-flex items-center gap-3 px-8 py-4.5 text-[16px] font-bold transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
                style={{
                  background: t.accentGradient,
                  color: t.ctaText,
                  borderRadius: "16px",
                  boxShadow: `0 8px 32px ${t.accent}30`,
                }}
              >
                <Mail className="w-[18px] h-[18px]" />
                이메일 보내기
                <ArrowUpRight className="w-4 h-4 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
              </a>

              <p
                className="mt-4 text-[14px] font-medium"
                style={{ color: t.textMuted }}
              >
                {email}
              </p>
            </div>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div ref={linksRef} style={linksStyle} className="flex flex-wrap justify-center gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.type}
                  href={link.href}
                  onClick={() => handleContactClick(link.type)}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2.5 px-5 py-3 text-[14px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    backgroundColor: t.cardBg,
                    border: `1px solid ${t.cardBorder}`,
                    borderRadius: "14px",
                    boxShadow: t.cardShadow,
                    color: t.text,
                  }}
                >
                  <link.icon className="w-[18px] h-[18px]" style={{ color: t.accent }} />
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
