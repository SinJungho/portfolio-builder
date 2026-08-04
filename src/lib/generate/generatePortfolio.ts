import { prisma } from "@/lib/prisma";
import { type RawProject, type Prisma } from "@prisma/client";
import { redis, JOB_KEY, JOB_TTL, JobStatus } from "@/lib/redis";
import { type AISummary } from "@/types/project";
import OpenAI from "openai";
import { revalidatePath } from "next/cache";
import { MAX_FEATURED_PROJECTS } from "@/lib/project-selection";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function updateJobProgress(jobId: string, updates: Partial<JobStatus>) {
  const key = JOB_KEY(jobId);
  const existingJobStr = await redis.get(key);
  if (existingJobStr) {
    const existingJob = typeof existingJobStr === 'string' ? JSON.parse(existingJobStr) : existingJobStr;
    const newJob = { ...existingJob, ...updates };
    await redis.set(key, JSON.stringify(newJob), { ex: JOB_TTL });
  }
}

export async function generatePortfolio(params: {
  jobId: string;
  portfolioId: string;
  userId: string;
  autoPublish: boolean;
  projectIds?: string[];
  goal?: string;
}): Promise<void> {
  const { jobId, portfolioId, userId, autoPublish, projectIds, goal } = params;

  try {
    await updateJobProgress(jobId, { status: "processing", progress: 0 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const rawProjects = await prisma.rawProject.findMany({
      where: { user_id: userId, is_fork: false },
    });

    await updateJobProgress(jobId, { progress: 10 });

    let topProjects: (RawProject & { calculatedScore: number })[] = [];

    if (projectIds && projectIds.length > 0) {
      // Use manually selected projects
      const selectedProjects = rawProjects.filter((p) =>
        projectIds.slice(0, MAX_FEATURED_PROJECTS).includes(p.id),
      );
      topProjects = selectedProjects
        .map(p => {
          let score = p.ai_score;
          if (score === null) {
            score = p.stargazers_count;
          }
          return { ...p, calculatedScore: score ?? 0 };
        })
        .sort((a, b) => b.calculatedScore - a.calculatedScore);
    } else {
      // AI auto-pick logic
      const projectsWithScore = rawProjects.map(p => {
        let score = p.ai_score;
        if (score === null) {
          let readme_quality = 0.0;
          if (p.raw_data) {
            const rawData = (typeof p.raw_data === 'string' ? JSON.parse(p.raw_data) : p.raw_data) as Record<string, unknown>;
            const readme = (rawData?.readme as string) || "";
            if (!readme) {
              readme_quality = 0.0;
            } else if (readme.length < 300) {
              readme_quality = 0.3;
            } else {
              readme_quality = 0.6;
              if (readme.includes("![")) readme_quality += 0.2;
              if (readme.includes("```")) readme_quality += 0.1;
              readme_quality = Math.min(readme_quality, 1.0);
            }
          }

          let recency = 0.1;
          if (p.pushed_at) {
            const days = (Date.now() - new Date(p.pushed_at).getTime()) / (1000 * 60 * 60 * 24);
            if (days <= 30) recency = 1.0;
            else if (days <= 90) recency = 0.7;
            else if (days <= 180) recency = 0.4;
          }

          const starsNorm = Math.min(p.stargazers_count / 100, 1.0);
          score = starsNorm * 0.3 + recency * 0.4 + readme_quality * 0.3;
        }
        return { ...p, calculatedScore: score ?? p.stargazers_count };
      });

      topProjects = projectsWithScore
        .sort((a, b) => b.calculatedScore - a.calculatedScore)
        .slice(0, MAX_FEATURED_PROJECTS);
    }

    // Language aggregation
    const languageCounts: Record<string, number> = {};
    const totalProjects = rawProjects.length;
    rawProjects.forEach(p => {
      if (p.language) {
        languageCounts[p.language] = (languageCounts[p.language] || 0) + 1;
      }
    });

    // AI Summary logic for top Projects
    for (const p of topProjects) {
      if (!p.ai_summary) {
        try {
          let readme = "";
          let rawData: Record<string, unknown> | null = null;
          if (p.raw_data) {
             rawData = (typeof p.raw_data === 'string' ? JSON.parse(p.raw_data) : p.raw_data) as Record<string, unknown>;
             readme = (rawData?.readme as string) || "";
          }

          // README 파일이 부실하거나 없는 경우에 대한 기본 플레이스홀더 텍스트 고도화
          if (!readme || readme.length <= 50) {
            const placeholderSummary = {
              headline: p.description || `${p.name} - 개발자의 신뢰도 높은 프로젝트입니다.`,
              highlights: [
                `${p.language || "주요 개발"} 언어를 활용하여 구현된 레포지토리입니다.`,
                p.pushed_at ? `${new Date(p.pushed_at).toLocaleDateString("ko-KR")}에 마지막으로 업데이트되었습니다.` : "신뢰할 수 있는 개발 히스토리가 기록되어 있습니다.",
                "상세 기능과 스펙은 프로젝트 저장소 코드를 통해 확인하실 수 있습니다."
              ],
              demo_url: (rawData?.homepage as string) || null,
              role: "주요 개발자"
            };
            const placeholderStr = JSON.stringify(placeholderSummary);
            p.ai_summary = placeholderStr;
            
            await prisma.rawProject.update({
              where: { id: p.id },
              data: { ai_summary: placeholderStr }
            });
            continue;
          }

          const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
              { 
                role: "system", 
                content: "당신은 IT 채용 담당자이자 포트폴리오 전문가입니다. 프로젝트 README를 분석하여 채용에 도움이 되는 핵심 정보를 추출해주세요. 반드시 JSON 형식으로만 응답해야 합니다." 
              },
              { 
                role: "user", 
                content: `프로젝트 이름: ${p.name}\n설명: ${p.description || ""}\nREADME: ${readme.substring(0, 3000)}\n\n위 정보를 바탕으로 다음 필드를 포함한 JSON으로 응답해주세요:\n- headline: 프로젝트를 한 줄로 설명하는 매력적인 문구\n- highlights: 주요 기능이나 기술적 성취 (2~3개 불렛 포인트)\n- demo_url: 라이브 데모 URL (README에서 찾을 수 있으면 포함, 없으면 null)\n- role: 개발자로서의 역할 (유추 가능하면 작성, 아니면 null)` 
              }
            ],
            response_format: { type: "json_object" }
          });
          const summaryData = completion.choices[0]?.message?.content || "{}";
          
          // JSON 파싱 검증 및 핵심 필드 fallback 안전 보정
          let parsedSummary: AISummary = {};
          try {
            parsedSummary = JSON.parse(summaryData) as AISummary;
          } catch (parseError) {
            console.warn("AI summary JSON parsing failed:", parseError);
            parsedSummary = {};
          }

          const defaultHeadline = p.description || `${p.name} - 개발자의 신뢰도 높은 프로젝트입니다.`;
          const defaultHighlights = p.description 
            ? [p.description.substring(0, 100)] 
            : ["상세 기능과 스펙은 프로젝트 저장소 코드를 통해 확인하실 수 있습니다."];

          const finalSummary = {
            headline: parsedSummary.headline || defaultHeadline,
            highlights: (Array.isArray(parsedSummary.highlights) && parsedSummary.highlights.length > 0)
              ? parsedSummary.highlights
              : defaultHighlights,
            demo_url: parsedSummary.demo_url || (rawData?.homepage as string) || null,
            role: parsedSummary.role || null
          };

          const summaryString = JSON.stringify(finalSummary);
          p.ai_summary = summaryString;
          
          // Cache the result to DB
          await prisma.rawProject.update({
            where: { id: p.id },
            data: { ai_summary: summaryString }
          });
        } catch (e) {
          console.error("OpenAI summary error for project:", p.name, e);
        }
      }
    }

    const skills = Object.entries(languageCounts)
      .map(([name, count]) => ({
        name,
        level: Math.max(10, Math.round((count / Math.max(totalProjects, 1)) * 100)),
      }))
      .sort((a, b) => b.level - a.level)
      .slice(0, 8);

    // AI 히어로 소개 — 한 줄 소개(subheadline)와 상세 소개(bio)를 한 번의 호출로 함께 생성해
    // 사용자가 빈 히어로가 아니라 "거의 완성된" 상태로 시작하게 한다. 실패 시 기존 동작으로 폴백.
    const bio = user.github_bio || "";
    let subheadline = bio.substring(0, 50);
    let heroBio = bio;

    try {
      const skillsStr = skills.map(s => s.name).join(", ");
      const projectsStr = topProjects.map(p => p.name).join(", ");
      const userGoal = goal ? `목표: ${goal}\n` : "";
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "당신은 개발자 포트폴리오 전문가입니다. 반드시 JSON 형식으로만 응답합니다."
        }, {
          role: "user",
          content: `${userGoal}GitHub bio: ${bio}\n사용 언어: ${skillsStr}\n대표 프로젝트: ${projectsStr}\n위 정보를 바탕으로 채용 담당자에게 어필할 포트폴리오 소개를 한국어로 작성해줘. 다음 JSON 필드로 응답:\n- subheadline: 직군 + 핵심 기술 + 강점 형태의 한 줄 소개 (50자 이내)\n- bio: 어떤 개발자이고 무엇을 잘하는지 2~3문장으로 자연스럽게 (200자 이내)`,
        }],
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(completion.choices[0]?.message?.content || "{}") as {
        subheadline?: string;
        bio?: string;
      };
      if (parsed.subheadline?.trim()) subheadline = parsed.subheadline.trim();
      if (parsed.bio?.trim()) heroBio = parsed.bio.trim();
    } catch (e) {
      console.error("OpenAI hero intro error:", e);
    }

    await updateJobProgress(jobId, { progress: 30 });

    const portfolioBlocksData: Prisma.PortfolioBlockCreateManyInput[] = [];

    // Hero Block
    portfolioBlocksData.push({
      portfolio_id: portfolioId,
      block_type: "hero",
      position: 0,
      config: {
        headline: user.name || user.github_login || "Developer",
        subheadline,
        bio: heroBio,
        show_github_stats: true,
      },
      is_visible: true,
      is_ai_generated: true,
    });

    await updateJobProgress(jobId, { progress: 50 });

    // Project Grid Block
    portfolioBlocksData.push({
      portfolio_id: portfolioId,
      block_type: "project_grid",
      position: 1,
      config: {
        layout: "grid",
        columns: 2,
        project_ids: topProjects.map(p => p.id),
        show_tech_stack: true,
      },
      is_visible: true,
      is_ai_generated: true,
    });

    // Skills Block
    portfolioBlocksData.push({
      portfolio_id: portfolioId,
      block_type: "skills",
      position: 2,
      config: {
        chart_type: "bar",
        skills,
      },
      is_visible: true,
      is_ai_generated: true,
    });

    await updateJobProgress(jobId, { progress: 70 });

    // Contact Block
    const contactConfig: Record<string, unknown> = {
      github_url: `https://github.com/${user.github_login}`,
    };
    if (user.email) {
      contactConfig.email = user.email;
    }

    // 연락(채용 문의) 블록은 페이지 마지막에 — peak-end. 블로그 피드가 뒤에 오면
    // 마무리 CTA가 글 목록에 묻히므로, 블로그(position 3)보다 뒤(position 4)에 배치.
    portfolioBlocksData.push({
      portfolio_id: portfolioId,
      block_type: "contact",
      position: 4,
      config: contactConfig as Prisma.InputJsonValue,
      is_visible: true,
      is_ai_generated: true,
    });

    // Blog Feed Block
    const blogIntegrations = await prisma.integration.findMany({
      where: {
        user_id: userId,
        provider: { in: ["tistory", "velog", "medium"] },
        is_active: true,
      },
    });

    if (blogIntegrations.length > 0) {
      portfolioBlocksData.push({
        portfolio_id: portfolioId,
        block_type: "blog_feed",
        position: 3, // 연락 블록(4)보다 앞 — 연락 CTA가 항상 페이지 마지막
        config: {
          integration_provider: blogIntegrations[0].provider,
          max_items: 3,
          show_thumbnail: true,
        },
        is_visible: true,
        is_ai_generated: true,
      });
    }

    await updateJobProgress(jobId, { progress: 85 });

    await prisma.portfolioBlock.createMany({
      data: portfolioBlocksData,
    });

    await updateJobProgress(jobId, { progress: 95 });

    let finalSlug = "";
    const pUpdate = await prisma.portfolio.findUnique({
      where: { id: portfolioId }
    });
    if (pUpdate) {
      finalSlug = pUpdate.slug;
    }

    if (autoPublish && finalSlug) {
      await prisma.portfolio.update({
        where: { id: portfolioId },
        data: {
          is_published: true,
          auto_published: true,
          published_at: new Date(),
        },
      });

      revalidatePath(`/${finalSlug}`);
      revalidatePath("/dashboard");
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
    const publishedUrl = (autoPublish && finalSlug) 
      ? (appUrl.includes("127.0.0.1") || appUrl.includes("localhost") ? `http://localhost:3000/${finalSlug}` : `https://${finalSlug}.portfolioforge.app`)
      : null;

    const missing_optional_fields = [];
    if (!user.email) missing_optional_fields.push("email");
    missing_optional_fields.push("linkedin_url", "website_url");

    await updateJobProgress(jobId, {
      status: "completed",
      progress: 100,
      published_url: publishedUrl,
      missing_optional_fields,
    });

  } catch (error: unknown) {
    console.error("generatePortfolio error:", error);
    await updateJobProgress(jobId, { status: "failed", error: (error as Error).message });
  }
}
