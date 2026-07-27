import { NextResponse, after } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redis, ratelimit, JOB_KEY, JOB_TTL, JobStatus } from "@/lib/redis";
import { generatePortfolio } from "@/lib/generate/generatePortfolio";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse(null, { status: 401 });
    }

    const { user } = session;

    // Rate Limiting 검증 (AI 자동 생성 비용 및 트래픽 방어)
    const { success } = await ratelimit.limit(`generate_${user.id}`);
    if (!success) {
      return NextResponse.json(
        { error: "포트폴리오 생성 요청이 너무 많습니다. 잠시 후 다시 시도해 주세요." },
        { status: 429 }
      );
    }

    let json: Record<string, unknown> = {};
    try {
      json = await req.json();
    } catch {
      // ignore
    }

    const portfolio_id = json.portfolio_id as string;
    const auto_publish = (json.auto_publish as boolean) ?? false;
    const project_ids = json.project_ids as string[] | undefined;
    const ai_focus = json.ai_focus as string | undefined;

    if (!portfolio_id) {
      return NextResponse.json({ error: "portfolio_id is required" }, { status: 400 });
    }

    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolio_id },
    });

    if (!portfolio || portfolio.user_id !== user.id) {
      return new NextResponse(null, { status: 404 });
    }


    const job_id = crypto.randomUUID();

    const initialJobStatus: JobStatus = {
      status: "pending",
      progress: 0,
      portfolio_id,
      user_id: user.id,
      auto_publish,
    };

    try {
      await redis.set(JOB_KEY(job_id), JSON.stringify(initialJobStatus), { ex: JOB_TTL });
    } catch (e) {
      throw e;
    }
    after(async () => {
      await generatePortfolio({
        jobId: job_id,
        portfolioId: portfolio_id,
        userId: user.id,
        autoPublish: auto_publish,
        projectIds: project_ids,
        goal: ai_focus,
      }).catch(console.error);
    });

    return NextResponse.json({ job_id, estimated_seconds: 30 }, { status: 202 });
  } catch (error: unknown) {
    console.error("POST /api/portfolios/generate error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
