import { prisma } from '@/lib/prisma';
import { Portfolio } from '@prisma/client';

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
    let slug = baseSlug.toLowerCase().replace(/[^a-z0-9-]/g, '-');
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
    // 1. Plan Limit Check (Free: 1) - Removed for MVP
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const existingCount = await this.countByUserId(userId);

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
        auto_published: true, // MVP core principle: auto-publish by default
      },
    });
  }
}

export const portfolioService = new PortfolioService();
