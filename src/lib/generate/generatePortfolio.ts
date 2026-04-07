import { prisma } from "@/lib/prisma";
import { redis, JOB_KEY, JOB_TTL, JobStatus } from "@/lib/redis";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function updateJobProgress(jobId: string, updates: Partial<JobStatus>) {
  const key = JOB_KEY(jobId);
  const existingJobStr = await redis.get(key);
  if (existingJobStr) {
    let existingJob = typeof existingJobStr === 'string' ? JSON.parse(existingJobStr) : existingJobStr;
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

    let topProjects: any[] = [];

    if (projectIds && projectIds.length > 0) {
      // Use manually selected projects
      const selectedProjects = rawProjects.filter((p: any) => projectIds.includes(p.id));
      topProjects = selectedProjects
        .map((p: any) => {
          let score = p.ai_score;
          if (score === null) {
            score = p.stargazers_count;
          }
          return { ...p, calculatedScore: score ?? 0 };
        })
        .sort((a, b) => b.calculatedScore - a.calculatedScore);
    } else {
      // AI auto-pick logic
      const projectsWithScore = rawProjects.map((p: any) => {
        let score = p.ai_score;
        if (score === null) {
          let readme_quality = 0.0;
          if (p.raw_data) {
            const rawData: any = typeof p.raw_data === 'string' ? JSON.parse(p.raw_data) : p.raw_data;
            const readme = rawData?.readme || "";
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
        .slice(0, 4);
    }

    // Language aggregation
    const languageCounts: Record<string, number> = {};
    let totalProjects = rawProjects.length;
    rawProjects.forEach((p: any) => {
      if (p.language) {
        languageCounts[p.language] = (languageCounts[p.language] || 0) + 1;
      }
    });

    // AI Summary logic for top Projects
    for (const p of topProjects) {
      if (!p.ai_summary) {
        try {
          let readme = "";
          if (p.raw_data) {
             const rawData: any = typeof p.raw_data === 'string' ? JSON.parse(p.raw_data) : p.raw_data;
             readme = rawData?.readme || "";
          }
          if (readme && readme.length > 50) {
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
            p.ai_summary = summaryData;
            
            // Cache the result to DB
            await prisma.rawProject.update({
              where: { id: p.id },
              data: { ai_summary: summaryData }
            });
          }
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

    // AI subheadline
    const bio = user.github_bio || "";
    let subheadline = bio.substring(0, 50);

    try {
      const skillsStr = skills.map((s: any) => s.name).join(", ");
      const userGoal = goal ? `목표: ${goal}\n` : "";
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{
          role: "system",
          content: "당신은 개발자 포트폴리오 전문가입니다."
        }, {
          role: "user",
          content: `${userGoal}GitHub bio: ${bio}\n사용 언어: ${skillsStr}\n위 정보를 바탕으로 채용 담당자에게 어필할 수 있는 한 줄 소개를 한국어로 작성해줘. 직군 + 핵심 기술 + 강점 형태로, 50자 이내로.`,
        }],
      });
      if (completion.choices[0]?.message?.content) {
        subheadline = completion.choices[0].message.content;
      }
    } catch (e) {
      console.error("OpenAI subheadline error:", e);
    }

    await updateJobProgress(jobId, { progress: 30 });

    const portfolioBlocksData: any[] = [];

    // Hero Block
    portfolioBlocksData.push({
      portfolio_id: portfolioId,
      block_type: "hero",
      position: 0,
      config: {
        headline: user.name || user.github_login || "Developer",
        subheadline,
        bio: user.github_bio || "",
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
        project_ids: topProjects.map((p: any) => p.id),
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
        chart_type: "radar",
        skills,
      },
      is_visible: true,
      is_ai_generated: true,
    });

    await updateJobProgress(jobId, { progress: 70 });

    // Contact Block
    const contactConfig: any = {
      github_url: `https://github.com/${user.github_login}`,
    };
    if (user.email) {
      contactConfig.email = user.email;
    }

    portfolioBlocksData.push({
      portfolio_id: portfolioId,
      block_type: "contact",
      position: 3,
      config: contactConfig,
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
        position: 4,
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

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://127.0.0.1:3000";
      fetch(`${appUrl}/api/revalidate`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-internal-secret": process.env.INTERNAL_API_SECRET || ""
        },
        body: JSON.stringify({ slug: finalSlug }),
      }).catch(console.error);
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

  } catch (error: any) {
    console.error("generatePortfolio error:", error);
    await updateJobProgress(jobId, { status: "failed", error: error.message });
  }
}
