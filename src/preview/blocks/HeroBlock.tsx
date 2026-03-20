import React from "react";
import Image from "next/image";

interface HeroBlockProps {
  config: {
    headline: string;
    subheadline: string;
    bio: string;
    show_github_stats?: boolean;
    github_login?: string;
  };
}

export default function HeroBlock({ config }: HeroBlockProps) {
  const { headline, subheadline, bio, show_github_stats, github_login } = config;

  // Derive github username from GitHub avatar API if possible, or fallback
  const avatarUrl = github_login 
    ? `https://github.com/${github_login}.png` 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(headline)}&size=200`;

  return (
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Subtle Glow behind the user */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #3182F6 0%, #8B5CF6 50%, transparent 100%)' }}
      />
      
      <div className="relative flex flex-col md:flex-row items-center gap-12 md:gap-20">
        <div className="flex-1 space-y-8 text-center md:text-left">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-[-3px] leading-[1.1] text-current italic">
              {headline}
            </h1>
            <h2 className="text-xl md:text-2xl font-bold opacity-70 tracking-tight">
              {subheadline}
            </h2>
          </div>
          
          <p className="text-lg md:text-xl font-medium opacity-60 leading-relaxed max-w-2xl mx-auto md:mx-0">
            {bio}
          </p>

          {show_github_stats && github_login && (
            <div className="inline-block p-6 rounded-[32px] bg-current/5 border border-current/10 backdrop-blur-sm">
              <h3 className="text-[12px] font-extrabold uppercase tracking-[2px] mb-4 opacity-50">
                GitHub Contributions
              </h3>
              <div className="w-full max-w-sm">
                <img 
                  src={`https://ghchart.rshah.org/${github_login}`} 
                  alt="GitHub Contributions" 
                  className="w-full h-auto grayscale brightness-110 opacity-80 mix-blend-multiply dark:mix-blend-screen"
                  loading="lazy"
                />
              </div>
            </div>
          )}
        </div>

        <div className="shrink-0 relative">
          {/* Decorative Ring */}
          <div className="absolute inset-0 -m-4 rounded-full border border-current/5 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-0 -m-8 rounded-full border border-current/3 animate-[spin_15s_linear_infinite_reverse]" />
          
          <div className="relative w-56 h-56 md:w-80 md:h-80 rounded-[48px] overflow-hidden -rotate-2 hover:rotate-0 transition-all duration-700 shadow-[0_20px_60px_rgba(0,0,0,0.15)] group">
            <Image
              src={avatarUrl}
              alt={headline}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized={true}
            />
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
