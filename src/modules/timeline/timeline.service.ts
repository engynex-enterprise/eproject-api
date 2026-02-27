import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { TimelineQueryDto } from './dto/timeline-query.dto.js';

@Injectable()
export class TimelineService {
  constructor(private readonly prisma: PrismaService) {}

  async getTimeline(projectId: string, query: TimelineQueryDto) {
    const numericProjectId = Number(projectId);

    const where: any = {
      projectId: numericProjectId,
      deletedAt: null,
      OR: [
        { startDate: { not: null } },
        { dueDate: { not: null } },
      ],
    };

    if (query.spaceId) where.spaceId = Number(query.spaceId);
    if (query.epicId) where.epicId = Number(query.epicId);

    if (query.startDate || query.endDate) {
      where.AND = [];
      if (query.startDate) {
        where.AND.push({
          OR: [
            { dueDate: { gte: new Date(query.startDate) } },
            { startDate: { gte: new Date(query.startDate) } },
          ],
        });
      }
      if (query.endDate) {
        where.AND.push({
          OR: [
            { startDate: { lte: new Date(query.endDate) } },
            { dueDate: { lte: new Date(query.endDate) } },
          ],
        });
      }
    }

    const issues = await this.prisma.issue.findMany({
      where,
      select: {
        id: true,
        title: true,
        issueNumber: true,
        startDate: true,
        dueDate: true,
        storyPoints: true,
        status: {
          select: { id: true, name: true, color: true, statusGroupId: true },
        },
        priority: {
          select: { id: true, name: true, color: true },
        },
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        issueType: {
          select: { id: true, name: true, iconName: true, color: true },
        },
        parent: {
          select: { id: true, title: true, issueNumber: true },
        },
        space: {
          select: { id: true, name: true },
        },
      },
      orderBy: [{ startDate: 'asc' }, { dueDate: 'asc' }],
    });

    return issues;
  }

  async getTimelineByKey(projectKey: string, query: TimelineQueryDto) {
    const project = await this.prisma.project.findFirst({
      where: { key: projectKey, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const issues = await this.getTimeline(String(project.id), query);

    // Compute date range from all issues
    let startDate = new Date().toISOString();
    let endDate = new Date().toISOString();

    const allIssues = Array.isArray(issues) ? issues : [];
    if (allIssues.length > 0) {
      const dates = allIssues
        .flatMap((i: any) => [i.startDate, i.dueDate])
        .filter(Boolean)
        .map((d: any) => new Date(d).getTime());

      if (dates.length > 0) {
        startDate = new Date(Math.min(...dates)).toISOString();
        endDate = new Date(Math.max(...dates)).toISOString();
      }
    }

    return {
      issues: allIssues.map((i: any) => ({
        ...i,
        issueKey: `${project.key}-${i.issueNumber}`,
        dependencies: [], // TODO: fetch from issue_relations
      })),
      startDate,
      endDate,
    };
  }
}
