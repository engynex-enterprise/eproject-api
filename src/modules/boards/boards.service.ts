import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateBoardDto } from './dto/create-board.dto.js';
import { UpdateBoardDto } from './dto/update-board.dto.js';

export interface BoardDataFilters {
  assigneeId?: number;
  issueTypeId?: number;
  search?: string;
  sprintId?: number;
}

@Injectable()
export class BoardsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns board data (columns with issues) for a project looked up by key.
   * This is the main endpoint the Kanban board consumes.
   */
  async getBoardDataByProjectKey(projectKey: string, filters?: BoardDataFilters) {
    // Find project by key (pick the first non-deleted match)
    const project = await this.prisma.project.findFirst({
      where: { key: projectKey, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with key "${projectKey}" not found`);
    }

    // Get project statuses ordered by sortOrder — these become our columns
    const projectStatuses = await this.prisma.projectStatus.findMany({
      where: { projectId: project.id },
      include: { status: { include: { statusGroup: true } } },
      orderBy: { sortOrder: 'asc' },
    });

    // Build issue where clause
    const issueWhere: Record<string, unknown> = {
      projectId: project.id,
      deletedAt: null,
    };

    if (filters?.assigneeId) {
      issueWhere.assigneeId = filters.assigneeId === -1 ? undefined : filters.assigneeId;
    }
    if (filters?.issueTypeId) {
      issueWhere.issueTypeId = filters.issueTypeId;
    }
    if (filters?.sprintId) {
      issueWhere.sprintId = filters.sprintId;
    }
    if (filters?.search) {
      issueWhere.title = { contains: filters.search, mode: 'insensitive' };
    }

    // Fetch all issues for this project
    const issues = await this.prisma.issue.findMany({
      where: issueWhere,
      include: {
        issueType: true,
        status: { include: { statusGroup: true } },
        priority: true,
        assignee: true,
        reporter: true,
        sprint: true,
        version: true,
        space: true,
        tags: { include: { tag: true } },
      },
      orderBy: { boardPosition: 'asc' },
    });

    // Map issues to frontend shape (add issueKey and order)
    const mappedIssues = issues.map((issue) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      projectId: issue.projectId,
      issueTypeId: issue.issueTypeId,
      issueType: {
        id: issue.issueType.id,
        name: issue.issueType.name,
        description: null,
        icon: issue.issueType.iconName || 'task',
        color: issue.issueType.color || '#3B82F6',
        projectId: null,
        isSubtask: issue.issueType.name === 'Sub-task',
        createdAt: issue.issueType.createdAt.toISOString(),
        updatedAt: issue.issueType.createdAt.toISOString(),
      },
      statusId: issue.statusId,
      status: {
        id: issue.status.id,
        name: issue.status.name,
        description: issue.status.description,
        color: issue.status.color,
        category: issue.status.statusGroup?.name || 'To Do',
        order: 0,
        createdAt: issue.status.createdAt.toISOString(),
        updatedAt: issue.status.createdAt.toISOString(),
      },
      priorityId: issue.priorityId,
      priority: issue.priority
        ? {
            id: issue.priority.id,
            name: issue.priority.name,
            level: issue.priority.name.toLowerCase(),
            icon: issue.priority.iconName || 'medium',
            color: issue.priority.color || '#3B82F6',
            order: issue.priority.value,
            createdAt: issue.priority.createdAt.toISOString(),
            updatedAt: issue.priority.createdAt.toISOString(),
          }
        : null,
      assigneeId: issue.assigneeId,
      assignee: issue.assignee
        ? {
            id: issue.assignee.id,
            email: issue.assignee.email,
            firstName: issue.assignee.firstName,
            lastName: issue.assignee.lastName,
            displayName: issue.assignee.displayName,
            avatarUrl: issue.assignee.avatarUrl,
          }
        : null,
      reporterId: issue.reporterId,
      reporter: {
        id: issue.reporter.id,
        email: issue.reporter.email,
        firstName: issue.reporter.firstName,
        lastName: issue.reporter.lastName,
        displayName: issue.reporter.displayName,
        avatarUrl: issue.reporter.avatarUrl,
      },
      parentId: issue.parentId,
      sprintId: issue.sprintId,
      sprint: issue.sprint
        ? {
            id: issue.sprint.id,
            name: issue.sprint.name,
            goal: issue.sprint.goal,
            status: issue.sprint.status,
            startDate: issue.sprint.startDate?.toISOString() || null,
            endDate: issue.sprint.endDate?.toISOString() || null,
          }
        : null,
      versionId: issue.versionId,
      version: issue.version
        ? {
            id: issue.version.id,
            name: issue.version.name,
            status: issue.version.status,
            releaseDate: issue.version.releaseDate?.toISOString() || null,
          }
        : null,
      spaceId: issue.spaceId,
      space: issue.space
        ? { id: issue.space.id, name: issue.space.name, key: issue.space.key }
        : null,
      storyPoints: issue.storyPoints ? Number(issue.storyPoints) : null,
      startDate: issue.startDate?.toISOString() || null,
      dueDate: issue.dueDate?.toISOString() || null,
      issueKey: `${project.key}-${issue.issueNumber}`,
      order: issue.boardPosition,
      tags: issue.tags.map((it) => ({
        id: it.tag.id,
        name: it.tag.name,
        color: it.tag.color,
      })),
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
    }));

    // Group issues by statusId
    const issuesByStatus = new Map<number, typeof mappedIssues>();
    for (const issue of mappedIssues) {
      const group = issuesByStatus.get(issue.statusId) || [];
      group.push(issue);
      issuesByStatus.set(issue.statusId, group);
    }

    // Build columns
    const columns = projectStatuses.map((ps, index) => ({
      id: ps.id,
      boardId: 0,
      statusId: ps.statusId,
      status: {
        id: ps.status.id,
        name: ps.status.name,
        description: ps.status.description,
        color: ps.status.color,
        category: ps.status.statusGroup?.name || 'To Do',
        order: ps.sortOrder,
        createdAt: ps.status.createdAt.toISOString(),
        updatedAt: ps.status.createdAt.toISOString(),
      },
      order: index,
      wipLimit: null,
      issues: issuesByStatus.get(ps.statusId) || [],
    }));

    return { columns };
  }

  async getBacklogByProjectKey(projectKey: string) {
    const project = await this.prisma.project.findFirst({
      where: { key: projectKey, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException(`Project with key "${projectKey}" not found`);
    }

    const issueInclude = {
      issueType: true,
      status: { include: { statusGroup: true } },
      priority: true,
      assignee: {
        select: { id: true, email: true, firstName: true, lastName: true, displayName: true, avatarUrl: true },
      },
      reporter: {
        select: { id: true, email: true, firstName: true, lastName: true, displayName: true, avatarUrl: true },
      },
      sprint: true,
      tags: { include: { tag: true } },
    };

    // Fetch all sprints for this project with their issues
    const sprints = await this.prisma.sprint.findMany({
      where: { projectId: project.id },
      include: {
        issues: {
          where: { deletedAt: null },
          include: issueInclude,
          orderBy: { backlogPosition: 'asc' },
        },
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE first, then PLANNED, then COMPLETED
        { createdAt: 'desc' },
      ],
    });

    // Fetch backlog issues (not in any sprint)
    const backlogIssues = await this.prisma.issue.findMany({
      where: {
        projectId: project.id,
        sprintId: null,
        deletedAt: null,
      },
      include: issueInclude,
      orderBy: { backlogPosition: 'asc' },
    });

    // Helper to map a single issue to frontend shape
    const mapIssue = (issue: any) => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      projectId: issue.projectId,
      issueTypeId: issue.issueTypeId,
      issueType: {
        id: issue.issueType.id,
        name: issue.issueType.name,
        description: null,
        icon: issue.issueType.iconName || 'task',
        color: issue.issueType.color || '#3B82F6',
        projectId: null,
        isSubtask: issue.issueType.name === 'Sub-task',
        createdAt: issue.issueType.createdAt.toISOString(),
        updatedAt: issue.issueType.createdAt.toISOString(),
      },
      statusId: issue.statusId,
      status: {
        id: issue.status.id,
        name: issue.status.name,
        description: issue.status.description,
        color: issue.status.color,
        category: issue.status.statusGroup?.name || 'To Do',
        order: 0,
        createdAt: issue.status.createdAt.toISOString(),
        updatedAt: issue.status.createdAt.toISOString(),
      },
      priorityId: issue.priorityId,
      priority: issue.priority
        ? {
            id: issue.priority.id,
            name: issue.priority.name,
            level: issue.priority.name.toLowerCase(),
            icon: issue.priority.iconName || 'medium',
            color: issue.priority.color || '#3B82F6',
            order: issue.priority.value,
            createdAt: issue.priority.createdAt.toISOString(),
            updatedAt: issue.priority.createdAt.toISOString(),
          }
        : null,
      assigneeId: issue.assigneeId,
      assignee: issue.assignee
        ? {
            id: issue.assignee.id,
            email: issue.assignee.email,
            firstName: issue.assignee.firstName,
            lastName: issue.assignee.lastName,
            displayName: issue.assignee.displayName,
            avatarUrl: issue.assignee.avatarUrl,
          }
        : null,
      reporterId: issue.reporterId,
      reporter: {
        id: issue.reporter.id,
        email: issue.reporter.email,
        firstName: issue.reporter.firstName,
        lastName: issue.reporter.lastName,
        displayName: issue.reporter.displayName,
        avatarUrl: issue.reporter.avatarUrl,
      },
      parentId: issue.parentId,
      sprintId: issue.sprintId,
      sprint: issue.sprint
        ? {
            id: issue.sprint.id,
            name: issue.sprint.name,
            goal: issue.sprint.goal,
            status: issue.sprint.status,
            startDate: issue.sprint.startDate?.toISOString() || null,
            endDate: issue.sprint.endDate?.toISOString() || null,
          }
        : null,
      versionId: issue.versionId,
      version: null,
      spaceId: issue.spaceId,
      space: null,
      storyPoints: issue.storyPoints ? Number(issue.storyPoints) : null,
      startDate: issue.startDate?.toISOString() || null,
      dueDate: issue.dueDate?.toISOString() || null,
      issueKey: `${project.key}-${issue.issueNumber}`,
      order: issue.backlogPosition,
      tags: issue.tags.map((it: any) => ({
        id: it.tag.id,
        name: it.tag.name,
        color: it.tag.color,
      })),
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
    });

    // Fetch project issue types
    const projectIssueTypes = await this.prisma.projectIssueType.findMany({
      where: { projectId: project.id, isEnabled: true },
      include: { issueType: true },
      orderBy: { issueType: { hierarchyLevel: 'asc' } },
    });

    return {
      projectId: project.id,
      issueTypes: projectIssueTypes.map((pit) => ({
        id: pit.issueType.id,
        name: pit.issueType.name,
        description: pit.issueType.description,
        icon: pit.issueType.iconName || 'task',
        color: pit.issueType.color || '#3B82F6',
        isSubtask: pit.issueType.isSubtask,
        isDefault: pit.isDefault,
      })),
      sprints: sprints.map((sprint) => ({
        id: sprint.id,
        name: sprint.name,
        goal: sprint.goal,
        status: sprint.status,
        startDate: sprint.startDate?.toISOString() || null,
        endDate: sprint.endDate?.toISOString() || null,
        completedAt: sprint.completedAt?.toISOString() || null,
        projectId: sprint.projectId,
        createdAt: sprint.createdAt.toISOString(),
        updatedAt: sprint.updatedAt.toISOString(),
        issues: sprint.issues.map(mapIssue),
        totalPoints: sprint.issues.reduce(
          (sum, i) => sum + (i.storyPoints ? Number(i.storyPoints) : 0),
          0,
        ),
      })),
      backlogIssues: backlogIssues.map(mapIssue),
    };
  }

  async create(projectId: string, dto: CreateBoardDto) {
    const numProjectId = Number(projectId);

    return this.prisma.board.create({
      data: {
        projectId: numProjectId,
        name: dto.name,
        isDefault: dto.isDefault || false,
        columns: dto.columns || [],
        swimlanes: dto.swimlaneBy ? { groupBy: dto.swimlaneBy } : undefined,
      },
    });
  }

  async findAllByProject(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.board.findMany({
      where: { projectId: numProjectId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(boardId: string) {
    const numBoardId = Number(boardId);

    const board = await this.prisma.board.findUnique({
      where: { id: numBoardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async update(boardId: string, dto: UpdateBoardDto) {
    const numBoardId = Number(boardId);

    const board = await this.prisma.board.findUnique({
      where: { id: numBoardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return this.prisma.board.update({
      where: { id: numBoardId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.columns !== undefined && { columns: dto.columns }),
        ...(dto.swimlaneBy !== undefined && { swimlanes: { groupBy: dto.swimlaneBy } }),
      },
    });
  }

  async delete(boardId: string) {
    const numBoardId = Number(boardId);

    const board = await this.prisma.board.findUnique({
      where: { id: numBoardId },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    await this.prisma.board.delete({
      where: { id: numBoardId },
    });

    return { message: 'Board deleted successfully' };
  }
}
