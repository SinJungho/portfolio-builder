"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ThemeTokens } from "../themes";

interface HeroBlockProps {
  config: {
    headline: string;
    subheadline: string;
    bio: string;
    show_github_stats?: boolean;
    github_login?: string;
    github_repos_count?: number;
    github_stars_count?: number;
    github_contributions?: number;
  };
  theme: ThemeTokens;
  showContactLink?: boolean;
  showProjectsLink?: boolean;
  isCompactPreview?: boolean;
}

// 큰 수를 k 단위로 축약한다.
const formatCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n);

export default function HeroBlock({ config, theme: t, showContactLink, showProjectsLink, isCompactPreview = false }: HeroBlockProps) {
  const { headline, subheadline, bio, show_github_stats, github_login } = config;

  const [avatarError, setAvatarError] = useState(false);
  // GitHub 아바타가 없거나 로드에 실패하면 이니셜을 표시한다.
  const showGithubAvatar = Boolean(github_login) && !avatarError;
  // 첫 문자를 안전하게 추출해 대체 아바타에 사용한다.
  const initial = Array.from(headline.trim())[0] || "?";

  // 값이 없거나 기준 미만인 통계는 표시하지 않는다.
  const stats = [
    { label: "리포지토리", value: config.github_repos_count, min: 3 },
    { label: "받은 스타", value: config.github_stars_count, min: 1 },
    { label: "기여 횟수", value: config.github_contributions, min: 1 },
  ].filter(
    (stat): stat is { label: string; value: number; min: number } =>
      typeof stat.value === "number" && stat.value >= stat.min,
  );
  const hasGithubStats = stats.length > 0;

  const showStats = Boolean(show_github_stats && github_login && hasGithubStats);
  const showBio = Boolean(bio.trim()) && bio.trim() !== subheadline.trim();

  return (
    <section
      className="relative flex items-center -mx-6 md:-mx-8 px-6 md:px-8 overflow-hidden md:min-h-[52vh]"
    >

      <div className={`relative w-full max-w-[1100px] mx-auto flex ${isCompactPreview ? "flex-col-reverse" : "flex-col-reverse lg:flex-row"} items-center gap-12 lg:gap-20 py-14 md:py-16`}>
        <div
          className={`${isCompactPreview ? "w-full min-w-0 flex-none text-center" : "flex-1 text-center lg:text-left"} space-y-8`}
          style={isCompactPreview ? { width: "100%" } : undefined}
        >
          <div className="space-y-4">
            <h1
              className="text-[clamp(44px,7vw,72px)] font-extrabold leading-[1.02] tracking-[-1px] break-words"
              style={{ color: t.text }}
            >
              {headline}
            </h1>
            <p
            className="text-xl md:text-2xl font-semibold tracking-[-0.5px]"
              style={{ color: t.textMuted }}
            >
              {subheadline}
            </p>
          </div>

          {showBio && (
            <p
              className={`text-[17px] md:text-[18px] leading-[1.75] max-w-xl mx-auto ${isCompactPreview ? "" : "lg:mx-0"}`}
              style={{ color: t.textMuted }}
            >
              {bio}
            </p>
          )}

          {(showProjectsLink || showContactLink) && (
            <div className={`flex flex-wrap gap-3 justify-center ${isCompactPreview ? "" : "lg:justify-start"}`}>
              {showProjectsLink && (
                <a
                  href="#projects"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full px-6 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{ backgroundColor: t.ctaBg, color: t.ctaText, outlineColor: t.accent }}
                >
                  프로젝트 보기
                  <ArrowRight className="w-4 h-4" />
                </a>
              )}
              {showContactLink && (
                <a
                  href="#contact"
                  // 보조 CTA는 테마별 대비를 위해 중립 색상을 사용한다.
                  className="inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-bold transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4"
                  style={{
                    backgroundColor: t.cardBg,
                    color: t.text,
                    border: `1px solid ${t.cardBorder}`,
                    outlineColor: t.accent,
                  }}
                >
                  연락처 보기
                </a>
              )}
            </div>
          )}

          {showStats && (
            <dl className={`flex flex-wrap justify-center ${isCompactPreview ? "" : "lg:justify-start"}`}>
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex items-baseline gap-2 border-l px-4 first:border-l-0 first:pl-0"
                  style={{
                    borderColor: t.cardBorder,
                  }}
                >
                  <dd
                    className="text-[18px] font-extrabold tracking-tight leading-tight"
                    style={{ color: t.text }}
                  >
                    {formatCount(stat.value)}
                  </dd>
                  <dt className="text-[12px] font-semibold" style={{ color: t.textMuted }}>
                    {stat.label}
                  </dt>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="shrink-0 relative">
          <div
            className={`relative w-36 h-36 ${isCompactPreview ? "" : "md:w-60 md:h-60"} rounded-full overflow-hidden group flex items-center justify-center`}
            style={{
              backgroundColor: t.surfaceBg,
              border: `1px solid ${t.cardBorder}`,
            }}
          >
            {showGithubAvatar ? (
              <Image
                src={`https://github.com/${github_login}.png`}
                alt={`${headline}의 GitHub 프로필 이미지`}
                fill
                loading={isCompactPreview ? "lazy" : "eager"}
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={isCompactPreview ? "144px" : "(min-width: 768px) 240px, 144px"}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <span
                className={`text-6xl ${isCompactPreview ? "" : "md:text-7xl"} font-extrabold select-none`}
                style={{ color: t.textMuted }}
                aria-hidden="true"
              >
                {initial}
              </span>
            )}
          </div>
        </div>
      </div>


    </section>
  );
}
