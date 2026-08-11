import { render, screen } from "@testing-library/react";
import ResumePdfDocument from "../ResumePdfDocument";
import type { Block } from "@/stores/portfolioStore";

const projects = Array.from({ length: 4 }, (_, index) => ({
  id: `project-${index + 1}`,
  name: `프로젝트 ${index + 1}`,
  description: `프로젝트 ${index + 1} 설명`,
  ai_summary: JSON.stringify({
    headline: `프로젝트 ${index + 1} 결과`,
    highlights: [`프로젝트 ${index + 1} 하이라이트`],
    demo_url: index === 0 ? "https://demo.example.com" : null,
  }),
  ai_tags: ["TypeScript", "PostgreSQL"],
  html_url: `https://github.com/resume/project-${index + 1}`,
  language: "TypeScript",
  stargazers_count: index,
  pushed_at: "2026-08-01T00:00:00.000Z",
}));

const blocks: Block[] = [
  {
    id: "hero",
    block_type: "hero",
    position: 0,
    is_visible: true,
    is_ai_generated: false,
    config: {
      headline: "홍길동",
      subheadline: "백엔드 개발자",
      bio: "신뢰할 수 있는 서비스 운영과 문제 해결에 집중합니다.",
      github_login: "resume",
    },
  },
  {
    id: "skills",
    block_type: "skills",
    position: 1,
    is_visible: true,
    is_ai_generated: false,
    config: {
      skills: [
        { name: "PostgreSQL", level: 80 },
        { name: "TypeScript", level: 90 },
      ],
    },
  },
  {
    id: "projects",
    block_type: "project_grid",
    position: 2,
    is_visible: true,
    is_ai_generated: false,
    config: { projectsData: projects },
  },
  {
    id: "writing",
    block_type: "blog_feed",
    position: 3,
    is_visible: true,
    is_ai_generated: false,
    config: {
      feed_items: [
        {
          id: "post-1",
          title: "장애 없는 마이그레이션 기록",
          url: "https://blog.example.com/migration",
          published_at: "2026-07-10T00:00:00.000Z",
        },
      ],
    },
  },
  {
    id: "contact",
    block_type: "contact",
    position: 4,
    is_visible: true,
    is_ai_generated: false,
    config: {
      email: "resume@example.com",
      linkedin_url: "https://linkedin.com/in/resume",
    },
  },
];

describe("resume PDF document", () => {
  it("포트폴리오 블록을 ATS 친화적인 A4 이력서 구조로 제한해 렌더링한다", () => {
    const { container } = render(<ResumePdfDocument blocks={blocks} />);

    expect(screen.getByRole("article", { name: "홍길동 개발자 이력서" })).toBeTruthy();
    expect(screen.getByText("백엔드 개발자")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "프로젝트" })).toBeTruthy();
    expect(screen.getByText("신뢰할 수 있는 서비스 운영과 문제 해결에 집중합니다.")).toBeTruthy();
    expect(screen.getAllByText(/TypeScript/).length).toBeGreaterThan(0);
    expect(screen.getByText("resume@example.com").getAttribute("href")).toBe("mailto:resume@example.com");
    expect(screen.getByText("프로젝트 3")).toBeTruthy();
    expect(screen.queryByText("프로젝트 4")).toBeNull();
    expect(screen.getByText("장애 없는 마이그레이션 기록")).toBeTruthy();
    expect(screen.queryByText("포지로 만든 포트폴리오")).toBeNull();
    expect(container.querySelector("style")?.textContent).toContain("@page { size: A4 portrait");
    expect(container.querySelector("style")?.textContent).toContain("break-inside: avoid");
  });
});
