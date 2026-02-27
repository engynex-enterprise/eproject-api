import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { ReportQueryDto } from './dto/report-query.dto.js';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSprintBurndown(projectId: string, query: ReportQueryDto) {
    const numProjectId = Number(projectId);
    const sprintId = query.sprintId ? Number(query.sprintId) : undefined;

    if (!sprintId) {
      // Get the active sprint
      const activeSprint = await this.prisma.sprint.findFirst({
        where: { projectId: numProjectId, status: 'ACTIVE' },
      });

      if (!activeSprint) {
        return { sprint: null, data: [] };
      }

      return this.calculateBurndown(activeSprint.id);
    }

    return this.calculateBurndown(sprintId);
  }

  private async calculateBurndown(sprintId: number) {
    const sprint = await this.prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        issues: {
          where: { deletedAt: null },
          select: {
            id: true,
            storyPoints: true,
            statusId: true,
            createdAt: true,
            status: {
              select: {
                statusGroup: {
                  select: { name: true },
                },
              },
            },
          },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    const totalPoints = sprint.issues.reduce(
      (sum, issue) => sum + Number(issue.storyPoints || 0),
      0,
    );

    const completedPoints = sprint.issues
      .filter((issue) => issue.status.statusGroup.name === 'Done')
      .reduce((sum, issue) => sum + Number(issue.storyPoints || 0), 0);

    return {
      sprint: {
        id: sprint.id,
        name: sprint.name,
        startDate: sprint.startDate,
        endDate: sprint.endDate,
      },
      totalPoints,
      completedPoints,
      remainingPoints: totalPoints - completedPoints,
      totalIssues: sprint.issues.length,
      completedIssues: sprint.issues.filter(
        (i) => i.status.statusGroup.name === 'Done',
      ).length,
    };
  }

  async getVelocity(projectId: string) {
    const numProjectId = Number(projectId);

    const completedSprints = await this.prisma.sprint.findMany({
      where: { projectId: numProjectId, status: 'COMPLETED' },
      include: {
        issues: {
          where: {
            deletedAt: null,
            status: {
              statusGroup: { name: 'Done' },
            },
          },
          select: { storyPoints: true },
        },
      },
      orderBy: { completedAt: 'desc' },
      take: 10,
    });

    const velocityData = completedSprints.map((sprint) => ({
      sprintId: sprint.id,
      sprintName: sprint.name,
      completedAt: sprint.completedAt,
      completedPoints: sprint.issues.reduce(
        (sum, issue) => sum + Number(issue.storyPoints || 0),
        0,
      ),
      completedIssues: sprint.issues.length,
    }));

    const averageVelocity =
      velocityData.length > 0
        ? velocityData.reduce((sum, s) => sum + s.completedPoints, 0) /
          velocityData.length
        : 0;

    return {
      sprints: velocityData,
      averageVelocity: Math.round(averageVelocity * 10) / 10,
    };
  }

  async getCreatedVsResolved(projectId: string, query: ReportQueryDto) {
    const numProjectId = Number(projectId);

    const startDate = query.startDate
      ? new Date(query.startDate)
      : new Date(Date.now() - 30 * 24 * 3600000); // 30 days ago
    const endDate = query.endDate ? new Date(query.endDate) : new Date();

    const [created, resolved] = await Promise.all([
      this.prisma.issue.count({
        where: {
          projectId: numProjectId,
          deletedAt: null,
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.issue.count({
        where: {
          projectId: numProjectId,
          deletedAt: null,
          status: {
            statusGroup: { name: { in: ['Done', 'Cancelled'] } },
          },
          updatedAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    return {
      period: { startDate, endDate },
      created,
      resolved,
      netChange: created - resolved,
    };
  }
}
