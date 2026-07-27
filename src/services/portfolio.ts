import { prisma } from '@/lib/prisma';
import type { Block } from '@/stores/portfolioStore';
import type { RawProject, PortfolioBlock } from '@prisma/client';

export class PortfolioService {
  /**
   * Find a portfolio by ID
   */
  async findById(id: string) {
    return prisma.portfolio.findUnique({
      where: { id },
    });
  }

  /**
   * Find a portfolio by Slug
   */
  async findBySlug(slug: string) {
    return prisma.portfolio.findUnique({
      where: { slug },
    });
  }

  /**
   * Find all portfolios for a user
   */
  async findAllByUserId(userId: string) {
    return prisma.portfolio.findMany({
      where: { user_id: userId },
      orderBy: { updated_at: 'desc' },
    });
  }

  /**
   * Count portfolios for a user
   */
  async countByUserId(userId: string) {
    return prisma.portfolio.count({
      where: { user_id: userId },
    });
  }

  /**
   * Generate a unique slug based on github_login
   */
  async generateUniqueSlug(baseSlug: string): Promise<string> {
    const slug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    let counter = 1;
    let finalSlug = slug;

    while (true) {
      const existing = await this.findBySlug(finalSlug);
      if (!existing) return finalSlug;
      
      counter++;
      finalSlug = `${slug}-${counter}`;
    }
  }

  /**
   * Create a new portfolio record (Pre-generation)
   */
  async createEmpty(userId: string, data: { slug?: string; theme?: string }) {
    // 1. Plan Limit Check (Free: 1)
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const existingCount = await this.countByUserId(userId);

    if (user?.plan === 'free' && existingCount >= 1) {
      throw new Error('PLAN_LIMIT_EXCEEDED');
    }

    // 2. Slug logic
    const githubLogin = user?.github_login || 'user';
    const baseSlug = data.slug || githubLogin;
    const finalSlug = await this.generateUniqueSlug(baseSlug);

    // 3. Create
    return prisma.portfolio.create({
      data: {
        user_id: userId,
        slug: finalSlug,
        theme: data.theme || 'minimalist',
        generation_mode: 'auto',
        auto_published: false,
      },
    });
  }

  /**
   * 포트폴리오 slug를 바탕으로 포트폴리오 상세 정보와 하위 블록들(프로젝트, 블로그 피드 등)을
   * 일괄 일치시켜(Populate) 완전히 가공된 데이터로 반환합니다.
   * N+1 쿼리 최적화를 위해 프로젝트 조회는 단일 쿼리로 일괄 처리(Batch Fetching)합니다.
   */
  async getPopulatedPortfolioBySlug(slug: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { slug },
      include: {
        user: {
          select: { name: true },
        },
      },
    });

    if (!portfolio || !portfolio.is_published) {
      return null;
    }

    const rawBlocks = await prisma.portfolioBlock.findMany({
      where: {
        portfolio_id: portfolio.id,
        is_visible: true,
      },
      orderBy: { position: "asc" },
    });

    // 프로젝트 그리드 블록들에 속한 모든 고유 프로젝트 ID들을 사전에 취합합니다.
    const allProjectIds = rawBlocks
      .filter((block: PortfolioBlock) => block.block_type === "project_grid")
      .flatMap((block: PortfolioBlock) => {
        const config = (block.config || {}) as Record<string, unknown>;
        return (config.project_ids || []) as string[];
      });
    const uniqueProjectIds = Array.from(new Set(allProjectIds));

    // 메모리 매핑용 맵(Map)을 생성하여 N+1 조회를 방지하고 단일 쿼리로 일괄 조회합니다.
    const projectsMap = new Map<string, RawProject>();
    if (uniqueProjectIds.length > 0) {
      const projects = await prisma.rawProject.findMany({
        where: { id: { in: uniqueProjectIds } },
      });
      projects.forEach((proj: RawProject) => projectsMap.set(proj.id, proj));
    }

    // 각 블록의 config를 안전하게 객체로 정의하고, 프로젝트 및 블로그 피드를 결합합니다.
    const blocks: Block[] = await Promise.all(
      rawBlocks.map(async (block: PortfolioBlock) => {
        const config = (block.config || {}) as Record<string, unknown>;
        const validTypes = ["hero", "project_grid", "skills", "blog_feed", "contact"];
        const blockType = validTypes.includes(block.block_type)
          ? (block.block_type as Block["block_type"])
          : "hero";

        const newConfig: Record<string, unknown> = { ...config };

        // 프로젝트 데이터 Populate (일괄 조회해 둔 Map에서 신속하게 획득)
        if (block.block_type === "project_grid" && Array.isArray(config.project_ids)) {
          newConfig.projectsData = config.project_ids
            .map((id: unknown) => typeof id === "string" ? projectsMap.get(id) : undefined)
            .filter((p: RawProject | undefined): p is RawProject => p !== undefined);
        }

        // 블로그 RSS 피드 데이터 Populate
        if (block.block_type === "blog_feed") {
          const feedItems = await prisma.feedItem.findMany({
            where: {
              user_id: portfolio.user_id,
              integration: { provider: typeof config.integration_provider === "string" ? config.integration_provider : "" },
            },
            orderBy: { published_at: "desc" },
            take: (typeof config.max_items === "number" ? config.max_items : 4),
          });
          newConfig.feed_items = feedItems;
        }

        return {
          id: block.id,
          block_type: blockType,
          position: block.position,
          config: newConfig as Record<string, unknown>,
          is_visible: block.is_visible,
          is_ai_generated: block.is_ai_generated,
        };
      })
    );

    return {
      portfolio: {
        id: portfolio.id,
        user_id: portfolio.user_id,
        slug: portfolio.slug,
        title: portfolio.title,
        theme: portfolio.theme,
        design_tokens: (portfolio.design_tokens || {}) as Record<string, unknown>,
        seo_title: portfolio.seo_title,
        seo_description: portfolio.seo_description,
        og_image_url: portfolio.og_image_url,
        user: portfolio.user,
      },
      blocks,
    };
  }
}

export const portfolioService = new PortfolioService();
