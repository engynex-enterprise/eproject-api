import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { IssueKeyService } from './issue-key.service.js';
import { CreateIssueDto } from './dto/create-issue.dto.js';
import { UpdateIssueDto } from './dto/update-issue.dto.js';
import { IssueFilterDto } from './dto/issue-filter.dto.js';
import { MoveIssueDto } from './dto/move-issue.dto.js';
import { TransitionIssueDto } from './dto/transition-issue.dto.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';
import { paginate, PaginationMeta } from '../../common/dto/pagination.dto.js';

@Injectable()
export class IssuesService {
  private readonly logger = new Logger(IssuesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly issueKeyService: IssueKeyService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(projectId: string, userId: string, dto: CreateIssueDto) {
    const numericProjectId = Number(projectId);
    const numericUserId = Number(userId);

    const project = await this.prisma.project.findUnique({
      where: { id: numericProjectId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Get default status if not provided
    let statusId = dto.statusId;
    if (!statusId) {
      const defaultStatus = await this.prisma.projectStatus.findFirst({
        where: { projectId: numericProjectId, isDefault: true },
        orderBy: { sortOrder: 'asc' },
      });
      statusId = defaultStatus?.statusId;
    }

    // Generate issue number atomically
    const issueNumber = await this.issueKeyService.generateIssueNumber(projectId);

    const issue = await this.prisma.issue.create({
      data: {
        projectId: numericProjectId,
        title: dto.title,
        description: dto.description,
        issueNumber,
        issueTypeId: dto.issueTypeId,
        statusId: statusId!,
        priorityId: dto.priorityId,
        spaceId: dto.spaceId,
        assigneeId: dto.assigneeId,
        reporterId: numericUserId,
        parentId: dto.parentId,
        epicId: dto.epicId,
        sprintId: dto.sprintId,
        versionId: dto.versionId,
        storyPoints: dto.storyPoints,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
      include: {
        issueType: true,
        status: true,
        priority: true,
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });

    this.eventEmitter.emit(EventTypes.ISSUE_CREATED, {
      userId: numericUserId,
      projectId: numericProjectId,
      issueId: issue.id,
      timestamp: new Date(),
    });

    return issue;
  }

  async findAllByProjectKey(projectKey: string, filters: IssueFilterDto) {
    const project = await this.prisma.project.findFirst({
      where: { key: projectKey, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.findAllByProject(String(project.id), filters);
  }

  async findAllByProject(projectId: string, filters: IssueFilterDto) {
    const numericProjectId = Number(projectId);

    const where: any = {
      projectId: numericProjectId,
      deletedAt: null,
    };

    if (filters.statusId) where.statusId = filters.statusId;
    if (filters.priorityId) where.priorityId = filters.priorityId;
    if (filters.issueTypeId) where.issueTypeId = filters.issueTypeId;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.epicId) where.epicId = filters.epicId;
    if (filters.spaceId) where.spaceId = filters.spaceId;

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [issues, total] = await Promise.all([
      this.prisma.issue.findMany({
        where,
        ...paginate(page, limit),
        orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder?.toLowerCase() || 'desc' },
        include: {
          issueType: true,
          status: true,
          priority: true,
          assignee: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
          reporter: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      }),
      this.prisma.issue.count({ where }),
    ]);

    return {
      data: issues,
      meta: new PaginationMeta(page, limit, total),
    };
  }

  async findById(issueId: string) {
    const numericIssueId = Number(issueId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
      include: {
        issueType: true,
        status: true,
        priority: true,
        assignee: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true },
        },
        reporter: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true },
        },
        parent: {
          select: { id: true, title: true, issueNumber: true },
        },
        children: {
          where: { deletedAt: null },
          select: { id: true, title: true, issueNumber: true, statusId: true },
        },
        sprint: {
          select: { id: true, name: true },
        },
        space: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true, key: true },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    return issue;
  }

  async update(issueId: string, userId: string, dto: UpdateIssueDto) {
    const numericIssueId = Number(issueId);
    const numericUserId = Number(userId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Build update data and track changes for history
    const updateData: any = {};
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    const fieldsToCheck = [
      'title', 'description', 'issueTypeId', 'statusId', 'priorityId',
      'assigneeId', 'spaceId', 'parentId', 'epicId', 'sprintId',
      'versionId', 'storyPoints',
    ] as const;

    for (const field of fieldsToCheck) {
      if (dto[field] !== undefined && dto[field] !== (issue as any)[field]) {
        updateData[field] = dto[field];
        changes.push({
          field,
          oldValue: (issue as any)[field],
          newValue: dto[field],
        });
      }
    }

    if (dto.startDate !== undefined) {
      updateData.startDate = dto.startDate ? new Date(dto.startDate) : null;
    }
    if (dto.dueDate !== undefined) {
      updateData.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    const updatedIssue = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.issue.update({
        where: { id: numericIssueId },
        data: updateData,
        include: {
          issueType: true,
          status: true,
          priority: true,
          assignee: {
            select: { id: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
      });

      // Record history for each change
      if (changes.length > 0) {
        for (const change of changes) {
          await tx.issueHistory.create({
            data: {
              issueId: numericIssueId,
              userId: numericUserId,
              field: change.field,
              oldValue: change.oldValue != null ? String(change.oldValue) : null,
              newValue: change.newValue != null ? String(change.newValue) : null,
            },
          });
        }
      }

      return updated;
    });

    this.eventEmitter.emit(EventTypes.ISSUE_UPDATED, {
      userId: numericUserId,
      projectId: issue.projectId,
      issueId: numericIssueId,
      changes,
      timestamp: new Date(),
    });

    // Emit assignee change event
    if (dto.assigneeId !== undefined && dto.assigneeId !== issue.assigneeId) {
      this.eventEmitter.emit(EventTypes.ISSUE_ASSIGNED, {
        userId: numericUserId,
        projectId: issue.projectId,
        issueId: numericIssueId,
        assigneeId: dto.assigneeId,
        timestamp: new Date(),
      });
    }

    return updatedIssue;
  }

  async softDelete(issueId: string, userId: string) {
    const numericIssueId = Number(issueId);
    const numericUserId = Number(userId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    await this.prisma.issue.update({
      where: { id: numericIssueId },
      data: { deletedAt: new Date() },
    });

    this.eventEmitter.emit(EventTypes.ISSUE_DELETED, {
      userId: numericUserId,
      projectId: issue.projectId,
      issueId: numericIssueId,
      timestamp: new Date(),
    });

    return { message: 'Issue deleted successfully' };
  }

  async moveIssue(issueId: string, userId: string, dto: MoveIssueDto) {
    const numericIssueId = Number(issueId);
    const numericUserId = Number(userId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    const updateData: any = {};

    if (dto.sprintId !== undefined) updateData.sprintId = dto.sprintId;
    if (dto.statusId !== undefined) updateData.statusId = dto.statusId;
    if (dto.boardPosition !== undefined) updateData.boardPosition = dto.boardPosition;
    if (dto.backlogPosition !== undefined) updateData.backlogPosition = dto.backlogPosition;

    const updated = await this.prisma.issue.update({
      where: { id: numericIssueId },
      data: updateData,
    });

    this.eventEmitter.emit(EventTypes.ISSUE_MOVED, {
      userId: numericUserId,
      projectId: issue.projectId,
      issueId: numericIssueId,
      timestamp: new Date(),
    });

    return updated;
  }

  async transitionIssue(issueId: string, userId: string, dto: TransitionIssueDto) {
    const numericIssueId = Number(issueId);
    const numericUserId = Number(userId);

    const issue = await this.prisma.issue.findUnique({
      where: { id: numericIssueId, deletedAt: null },
      include: { project: true },
    });

    if (!issue) {
      throw new NotFoundException('Issue not found');
    }

    // Validate the target status exists for this project
    const targetStatus = await this.prisma.projectStatus.findFirst({
      where: { statusId: dto.statusId, projectId: issue.projectId },
    });

    if (!targetStatus) {
      throw new BadRequestException('Invalid status for this project');
    }

    // Check workflow transition validity
    const workflow = await this.prisma.workflow.findFirst({
      where: { projectId: issue.projectId, isDefault: true },
      include: { transitions: true },
    });

    if (workflow && workflow.transitions.length > 0) {
      const validTransition = workflow.transitions.find(
        (t) => t.fromStatusId === issue.statusId && t.toStatusId === dto.statusId,
      );

      if (!validTransition) {
        throw new BadRequestException(
          'This status transition is not allowed by the workflow',
        );
      }
    }

    const oldStatusId = issue.statusId;

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedIssue = await tx.issue.update({
        where: { id: numericIssueId },
        data: { statusId: dto.statusId },
        include: { status: true },
      });

      // Record history
      await tx.issueHistory.create({
        data: {
          issueId: numericIssueId,
          userId: numericUserId,
          field: 'statusId',
          oldValue: String(oldStatusId),
          newValue: String(dto.statusId),
        },
      });

      return updatedIssue;
    });

    this.eventEmitter.emit(EventTypes.ISSUE_TRANSITIONED, {
      userId: numericUserId,
      projectId: issue.projectId,
      issueId: numericIssueId,
      fromStatusId: oldStatusId,
      toStatusId: dto.statusId,
      timestamp: new Date(),
    });

    return updated;
  }
}
