import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class IssueKeyService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Atomically increments the project's issue counter and returns the new issue number.
   * Uses a raw SQL query to ensure atomicity under concurrent requests.
   */
  async generateIssueNumber(projectId: string): Promise<number> {
    const numericProjectId = Number(projectId);
    const result = await this.prisma.$queryRawUnsafe<Array<{ issue_counter: number }>>(
      `UPDATE "projects" SET "issue_counter" = "issue_counter" + 1 WHERE "id" = $1 RETURNING "issue_counter" AS issue_counter`,
      numericProjectId,
    );

    if (!result || result.length === 0) {
      throw new Error(`Project ${projectId} not found`);
    }

    return Number(result[0].issue_counter);
  }
}
