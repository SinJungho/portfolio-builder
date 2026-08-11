import React from "react";
import type { Block } from "@/stores/portfolioStore";
import { isContactableEmail } from "./contact";
import { parseProjectSummary, safeHttpUrl } from "./project-summary";

interface ResumePdfDocumentProps {
  blocks: Block[];
  ownerName?: string | null;
  portfolioTitle?: string | null;
}

interface ProjectData {
  id: string;
  name: string;
  description?: string | null;
  ai_summary?: string | null;
  ai_tags?: string[];
  html_url?: string | null;
  language?: string | null;
  stargazers_count?: number;
  pushed_at?: Date | string | null;
}

interface FeedItem {
  id: string;
  title: string;
  url: string;
  published_at?: Date | string | null;
}

const RESUME_CSS = `
  .resume-shell {
    min-height: 100dvh;
    padding: 24px 0;
    background: #e5e7eb;
    color: #1f2937;
  }
  .resume-document {
    box-sizing: border-box;
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    padding: 13mm 15mm 14mm;
    background: #ffffff;
    box-shadow: 0 12px 36px rgba(15, 23, 42, 0.16);
    color: #1f2937;
    font-family: Pretendard, Inter, Arial, sans-serif;
    font-size: 10.5pt;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }
  .resume-document * { box-sizing: border-box; }
  .resume-document a { color: inherit; text-underline-offset: 2px; }
  .resume-header {
    margin-bottom: 6mm;
    padding-bottom: 5mm;
    border-bottom: 2px solid #0f766e;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .resume-name {
    margin: 0;
    color: #111827;
    font-size: 27pt;
    font-weight: 800;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }
  .resume-role {
    margin: 2mm 0 0;
    color: #374151;
    font-size: 13pt;
    font-weight: 650;
    line-height: 1.35;
  }
  .resume-contact { margin-top: 4mm; font-style: normal; }
  .resume-contact-list,
  .resume-skills,
  .resume-highlights,
  .resume-links,
  .resume-writing-list {
    margin: 0;
    padding: 0;
  }
  .resume-contact-list {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5mm 5mm;
    list-style: none;
    color: #374151;
    font-size: 8.8pt;
  }
  .resume-contact-label { color: #4b5563; font-weight: 700; }
  .resume-section + .resume-section { margin-top: 5.5mm; }
  .resume-section-title {
    margin: 0 0 2.5mm;
    padding-bottom: 1.2mm;
    border-bottom: 1px solid #9ca3af;
    color: #0f766e;
    font-size: 9.5pt;
    font-weight: 800;
    letter-spacing: 0.08em;
    line-height: 1.2;
    break-after: avoid-page;
    page-break-after: avoid;
  }
  .resume-summary { margin: 0; color: #374151; white-space: pre-line; }
  .resume-skills {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5mm 5mm;
    list-style: none;
  }
  .resume-skills li { color: #1f2937; font-weight: 650; }
  .resume-project {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .resume-project + .resume-project {
    margin-top: 4.5mm;
    padding-top: 4mm;
    border-top: 1px solid #d1d5db;
  }
  .resume-project-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 4mm;
  }
  .resume-project-name {
    margin: 0;
    color: #111827;
    font-size: 12pt;
    font-weight: 800;
    line-height: 1.3;
  }
  .resume-project-meta {
    flex: none;
    color: #4b5563;
    font-size: 8.5pt;
    font-weight: 650;
  }
  .resume-project-summary { margin: 1.2mm 0 0; color: #374151; }
  .resume-highlights { margin-top: 1.2mm; padding-left: 4.5mm; }
  .resume-highlights li + li { margin-top: 0.6mm; }
  .resume-tech {
    margin: 1.6mm 0 0;
    color: #4b5563;
    font-size: 8.8pt;
    font-weight: 650;
  }
  .resume-links {
    display: flex;
    flex-wrap: wrap;
    gap: 1mm 4mm;
    margin-top: 1.2mm;
    list-style: none;
    color: #0f5f59;
    font-size: 8pt;
  }
  .resume-writing-list { list-style: none; }
  .resume-writing-item {
    display: flex;
    justify-content: space-between;
    gap: 5mm;
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .resume-writing-item + .resume-writing-item { margin-top: 1.5mm; }
  .resume-writing-title { color: #1f2937; font-weight: 650; }
  .resume-writing-date { flex: none; color: #6b7280; font-size: 8.5pt; }
  @media screen and (max-width: 820px) {
    .resume-shell { padding: 0; }
    .resume-document {
      width: 100%;
      min-height: 100dvh;
      padding: 28px 24px;
      box-shadow: none;
    }
  }
  @page { size: A4 portrait; margin: 12mm 14mm; }
  @media print {
    html, body { background: #ffffff !important; }
    .resume-shell { min-height: 0; padding: 0; background: #ffffff; }
    .resume-document {
      width: auto;
      min-height: 0;
      margin: 0;
      padding: 0;
      box-shadow: none;
    }
  }
`;

function dateLabel(value: Date | string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

export default function ResumePdfDocument({
  blocks,
  ownerName,
  portfolioTitle,
}: ResumePdfDocumentProps) {
  const visibleBlocks = blocks
    .filter((block) => block.is_visible)
    .sort((a, b) => a.position - b.position);
  const hero = visibleBlocks.find((block) => block.block_type === "hero")
    ?.config as
    | {
        headline?: string;
        subheadline?: string;
        bio?: string;
        github_login?: string;
      }
    | undefined;
  const contact = visibleBlocks.find((block) => block.block_type === "contact")
    ?.config as
    | {
        email?: string;
        github_url?: string;
        linkedin_url?: string;
        website_url?: string;
      }
    | undefined;

  const name = hero?.headline?.trim() || ownerName?.trim() || "개발자";
  const role = hero?.subheadline?.trim() || portfolioTitle?.trim() || null;
  const bio = hero?.bio?.trim();
  const summary = bio && bio !== role ? bio : null;

  const githubUrl =
    safeHttpUrl(contact?.github_url) ||
    safeHttpUrl(hero?.github_login ? `https://github.com/${hero.github_login}` : null);
  const email = contact?.email?.trim();
  const linkedinUrl = safeHttpUrl(contact?.linkedin_url);
  const websiteUrl = safeHttpUrl(contact?.website_url);
  const contacts = [
    email && isContactableEmail(email)
      ? { label: "Email", href: `mailto:${email}`, text: email }
      : null,
    githubUrl
      ? { label: "GitHub", href: githubUrl, text: displayUrl(githubUrl) }
      : null,
    linkedinUrl
      ? {
          label: "LinkedIn",
          href: linkedinUrl,
          text: displayUrl(linkedinUrl),
        }
      : null,
    websiteUrl
      ? {
          label: "Web",
          href: websiteUrl,
          text: displayUrl(websiteUrl),
        }
      : null,
  ].filter(
    (item): item is { label: string; href: string; text: string } => Boolean(item),
  );

  const skills = visibleBlocks
    .filter((block) => block.block_type === "skills")
    .flatMap((block) => {
      const value = (block.config as { skills?: unknown }).skills;
      return Array.isArray(value) ? value : [];
    })
    .filter(
      (skill): skill is { name: string; level: number } =>
        Boolean(
          skill &&
            typeof skill === "object" &&
            typeof (skill as { name?: unknown }).name === "string" &&
            typeof (skill as { level?: unknown }).level === "number",
        ),
    )
    .sort((a, b) => b.level - a.level)
    .filter(
      (skill, index, all) =>
        all.findIndex((item) => item.name.trim().toLowerCase() === skill.name.trim().toLowerCase()) ===
        index,
    );

  const projects = visibleBlocks
    .filter((block) => block.block_type === "project_grid")
    .flatMap((block) => {
      const value = (block.config as { projectsData?: unknown }).projectsData;
      const descriptions = (block.config as { custom_descriptions?: Record<string, string> })
        .custom_descriptions;
      return Array.isArray(value)
        ? value.map((project) => ({ project, descriptions }))
        : [];
    })
    .filter(
      (entry): entry is { project: ProjectData; descriptions: Record<string, string> | undefined } =>
        Boolean(
          entry.project &&
            typeof entry.project === "object" &&
            typeof (entry.project as { id?: unknown }).id === "string" &&
            typeof (entry.project as { name?: unknown }).name === "string",
        ),
    )
    .filter(
      (entry, index, all) =>
        all.findIndex((item) => item.project.id === entry.project.id) === index,
    )
    .slice(0, 3);

  const writing = visibleBlocks
    .filter((block) => block.block_type === "blog_feed")
    .flatMap((block) => {
      const value = (block.config as { feed_items?: unknown }).feed_items;
      return Array.isArray(value) ? value : [];
    })
    .filter(
      (item): item is FeedItem =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof (item as { id?: unknown }).id === "string" &&
            typeof (item as { title?: unknown }).title === "string" &&
            safeHttpUrl((item as { url?: unknown }).url),
        ),
    )
    .slice(0, 3);

  return (
    <div className="resume-shell">
      <style>{RESUME_CSS}</style>
      <article className="resume-document" aria-label={`${name} 개발자 이력서`}>
        <header className="resume-header">
          <h1 className="resume-name">{name}</h1>
          {role && <p className="resume-role">{role}</p>}
          {contacts.length > 0 && (
            <address className="resume-contact" aria-label="연락처">
              <ul className="resume-contact-list">
                {contacts.map((item) => (
                  <li key={`${item.label}-${item.href}`}>
                    <span className="resume-contact-label">{item.label}</span>{" "}
                    <a href={item.href}>{item.text}</a>
                  </li>
                ))}
              </ul>
            </address>
          )}
        </header>

        {summary && (
          <section className="resume-section" aria-labelledby="resume-summary-title">
            <h2 id="resume-summary-title" className="resume-section-title">
              소개
            </h2>
            <p className="resume-summary">{summary}</p>
          </section>
        )}

        {skills.length > 0 && (
          <section className="resume-section" aria-labelledby="resume-skills-title">
            <h2 id="resume-skills-title" className="resume-section-title">
              기술
            </h2>
            <ul className="resume-skills">
              {skills.map((skill) => (
                <li key={skill.name}>{skill.name.trim()}</li>
              ))}
            </ul>
          </section>
        )}

        {projects.length > 0 && (
          <section className="resume-section" aria-labelledby="resume-projects-title">
            <h2 id="resume-projects-title" className="resume-section-title">
              프로젝트
            </h2>
            {projects.map(({ project, descriptions }) => {
              const parsed = parseProjectSummary(project.ai_summary);
              const customDescription = descriptions?.[project.id]?.trim();
              const projectSummary =
                customDescription || parsed.headline || project.description?.trim() || null;
              const highlights = parsed.highlights
                .filter((item) => item !== projectSummary)
                .slice(0, 3);
              const tags = [project.language, ...(project.ai_tags || [])]
                .filter((item): item is string => Boolean(item?.trim()))
                .filter(
                  (item, index, all) =>
                    all.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) ===
                    index,
                )
                .slice(0, 8);
              const links = [
                parsed.demo_url ? { label: "Live", url: parsed.demo_url } : null,
                safeHttpUrl(project.html_url)
                  ? { label: "GitHub", url: safeHttpUrl(project.html_url) as string }
                  : null,
              ].filter(
                (item): item is { label: string; url: string } => Boolean(item),
              );
              const projectDate = dateLabel(project.pushed_at);

              return (
                <article className="resume-project" key={project.id}>
                  <div className="resume-project-heading">
                    <h3 className="resume-project-name">{project.name}</h3>
                    {(projectDate || (project.stargazers_count || 0) > 0) && (
                      <span className="resume-project-meta">
                        {[projectDate, (project.stargazers_count || 0) > 0
                          ? `GitHub ★ ${project.stargazers_count}`
                          : null]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    )}
                  </div>
                  {projectSummary && (
                    <p className="resume-project-summary">{projectSummary}</p>
                  )}
                  {highlights.length > 0 && (
                    <ul className="resume-highlights">
                      {highlights.map((highlight) => (
                        <li key={highlight}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                  {tags.length > 0 && (
                    <p className="resume-tech" aria-label="사용 기술">
                      {tags.join(" · ")}
                    </p>
                  )}
                  {links.length > 0 && (
                    <ul className="resume-links" aria-label={`${project.name} 링크`}>
                      {links.map((link) => (
                        <li key={`${link.label}-${link.url}`}>
                          <a href={link.url}>
                            {link.label}: {displayUrl(link.url)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              );
            })}
          </section>
        )}

        {writing.length > 0 && (
          <section className="resume-section" aria-labelledby="resume-writing-title">
            <h2 id="resume-writing-title" className="resume-section-title">
              기술 글
            </h2>
            <ul className="resume-writing-list">
              {writing.map((item) => (
                <li className="resume-writing-item" key={item.id}>
                  <a className="resume-writing-title" href={item.url}>
                    {item.title}
                  </a>
                  {dateLabel(item.published_at) && (
                    <time
                      className="resume-writing-date"
                      dateTime={new Date(item.published_at as Date | string).toISOString()}
                    >
                      {dateLabel(item.published_at)}
                    </time>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}
