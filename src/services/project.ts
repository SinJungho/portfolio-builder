import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export class ProjectService {
  /**
   * Find a raw project by external ID and user ID
   */
  async findByExternalId(userId: string, source: string, externalId: string) {
    return prisma.rawProject.findUnique({
      where: {
        user_id_source_external_id: {
          user_id: userId,
          source,
          external_id: externalId,
        },
      },
    });
  }

  /**
   * Create or update a raw project (upsert)
   */
  async upsertRawProject(data: Prisma.RawProjectCreateInput) {
    return prisma.rawProject.upsert({
      where: {
        user_id_source_external_id: {
          user_id: data.user.connect?.id || '', // Ensure user_id is handled
          source: data.source,
          external_id: data.external_id!,
        },
      },
      update: {
        name: data.name,
        description: data.description,
        html_url: data.html_url,
        language: data.language,
        stargazers_count: data.stargazers_count,
        forks_count: data.forks_count,
        is_fork: data.is_fork,
        pushed_at: data.pushed_at,
        raw_data: data.raw_data,
        updated_at: new Date(),
      },
      create: {
        ...data,
        raw_data: data.raw_data,
      },
    });
  }

  /**
   * Update push status from webhook
   */
  async updatePushStatus(userId: string, externalId: string, pushedAt: Date) {
    return prisma.rawProject.updateMany({
      where: {
        user_id: userId,
        source: 'github',
        external_id: externalId,
      },
      data: {
        pushed_at: pushedAt,
        updated_at: new Date(),
      },
    });
  }
}

export const projectService = new ProjectService();
