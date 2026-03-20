"use client";

import React from "react";
import { Github, Mail, Linkedin, Globe } from "lucide-react";

interface ContactBlockProps {
  config: {
    github_url?: string;
    email?: string;
    linkedin_url?: string;
    website_url?: string;
  };
}

export default function ContactBlock({ config }: ContactBlockProps) {
  const { github_url, email, linkedin_url, website_url } = config;

  const handleContactClick = async (type: string) => {
    // Analytics tracking (fire and forget)
    // POST /api/analytics/event { event_type: "contact_click", provider: type }
    try {
      await fetch("/api/analytics/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_type: "contact_click", provider: type }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <section className="relative py-24 px-6 overflow-hidden rounded-[48px] bg-current/2 border border-current/5 flex flex-col items-center text-center space-y-12">
      {/* Decorative background stuff */}
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-current/3 rounded-full blur-[80px]" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px]" />

      <div className="space-y-4 relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-[-2px] text-current leading-tight">
          Let&apos;s build something<br />amazing together.
        </h2>
        <p className="text-lg md:text-xl font-medium opacity-50 max-w-lg mx-auto leading-relaxed">
          새로운 기회와 협업은 언제나 환영입니다.<br />편하신 방법으로 연락주세요.
        </p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-4 relative z-10">
        {email && (
          <a
            href={`mailto:${email}`}
            onClick={() => handleContactClick("email")}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 px-8 py-5 rounded-[24px] bg-current text-white shadow-[0_12px_32px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(0,0,0,0.15)] transition-all duration-300 active:scale-95"
          >
            <Mail className="w-5 h-5" />
            <span className="text-[17px] font-bold">Email Me</span>
          </a>
        )}
        
        <div className="flex gap-4">
          {github_url && (
            <a
              href={github_url}
              onClick={() => handleContactClick("github")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-16 h-16 rounded-[24px] bg-white border border-current/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              title="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
          )}

          {linkedin_url && (
            <a
              href={linkedin_url}
              onClick={() => handleContactClick("linkedin")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-16 h-16 rounded-[24px] bg-white border border-current/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              title="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
          )}

          {website_url && (
            <a
              href={website_url}
              onClick={() => handleContactClick("website")}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center w-16 h-16 rounded-[24px] bg-white border border-current/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              title="Website"
            >
              <Globe className="w-6 h-6" />
            </a>
          )}
        </div>
      </div>

      <p className="text-[12px] font-bold opacity-30 uppercase tracking-[3px] mt-12">
        PortfolioForge · Designed for Developers
      </p>
    </section>
  );
}
