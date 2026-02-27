import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateSprintDto } from './dto/create-sprint.dto.js';
import { UpdateSprintDto } from './dto/update-sprint.dto.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';

@Injectable()
export class SprintsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(projectId: string, dto: CreateSprintDto) {
    const numProjectId = Number(projectId);

    return this.prisma.sprint.create({
      data: {
        projectId: numProjectId,
        name: dto.name,
        goal: dto.goal,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        status: 'PLANNED',
      },
    });
  }

  async findAllByProjectKey(projectKey: string) {
    const project = await this.prisma.project.findFirst({
      where: { key: projectKey, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.findAllByProject(String(project.id));
  }

  async findAllByProject(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.sprint.findMany({
      where: { projectId: numProjectId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(sprintId: string) {
    const numSprintId = Number(sprintId);

    const sprint = await this.prisma.sprint.findUnique({
      where: { id: numSprintId },
      include: {
        issues: {
          where: { deletedAt: null },
          include: {
            status: true,
            priority: true,
            assignee: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
        _count: {
          select: { issues: true },
        },
      },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return sprint;
  }

  async update(sprintId: string, dto: UpdateSprintDto) {
    const numSprintId = Number(sprintId);

    const sprint = await this.prisma.sprint.findUnique({
      where: { id: numSprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    return this.prisma.sprint.update({
      where: { id: numSprintId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.goal !== undefined && { goal: dto.goal }),
        ...(dto.startDate !== undefined && { startDate: new Date(dto.startDate) }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      },
    });
  }

  async delete(sprintId: string) {
    const numSprintId = Number(sprintId);

    const sprint = await this.prisma.sprint.findUnique({
      where: { id: numSprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status === 'ACTIVE') {
      throw new BadRequestException('Cannot delete an active sprint');
    }

    // Move issues back to backlog (remove sprint assignment)
    await this.prisma.issue.updateMany({
      where: { sprintId: numSprintId },
      data: { sprintId: null },
    });

    await this.prisma.sprint.delete({
      where: { id: numSprintId },
    });

    return { message: 'Sprint deleted successfully' };
  }

  async startSprint(sprintId: string, userId: string) {
    const numSprintId = Number(sprintId);
    const numUserId = Number(userId);

    const sprint = await this.prisma.sprint.findUnique({
      where: { id: numSprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status !== 'PLANNED') {
      throw new BadRequestException('Only planned sprints can be started');
    }

    // Validate only 1 active sprint per project
    const activeSprint = await this.prisma.sprint.findFirst({
      where: {
        projectId: sprint.projectId,
        status: 'ACTIVE',
      },
    });

    if (activeSprint) {
      throw new BadRequestException(
        `Sprint "${activeSprint.name}" is already active. Complete it before starting a new one.`,
      );
    }

    const updated = await this.prisma.sprint.update({
      where: { id: numSprintId },
      data: {
        status: 'ACTIVE',
        startDate: sprint.startDate || new Date(),
      },
    });

    this.eventEmitter.emit(EventTypes.SPRINT_STARTED, {
      userId: numUserId,
      projectId: sprint.projectId,
      sprintId: numSprintId,
      timestamp: new Date(),
    });

    return updated;
  }

  async completeSprint(sprintId: string, userId: string) {
    const numSprintId = Number(sprintId);
    const numUserId = Number(userId);

    const sprint = await this.prisma.sprint.findUnique({
      where: { id: numSprintId },
    });

    if (!sprint) {
      throw new NotFoundException('Sprint not found');
    }

    if (sprint.status !== 'ACTIVE') {
      throw new BadRequestException('Only active sprints can be completed');
    }

    // Find incomplete issues (status group name is not Done/Cancelled)
    const incompleteIssues = await this.prisma.issue.findMany({
      where: {
        sprintId: numSprintId,
        deletedAt: null,
        status: {
          statusGroup: {
            name: { notIn: ['Done', 'Cancelled'] },
          },
        },
      },
    });

    await this.prisma.$transaction(async (tx) => {
      // Complete the sprint
      await tx.sprint.update({
        where: { id: numSprintId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });

      // Move incomplete issues to backlog (remove sprint assignment)
      if (incompleteIssues.length > 0) {
        await tx.issue.updateMany({
          where: {
            id: { in: incompleteIssues.map((i) => i.id) },
          },
          data: { sprintId: null },
        });
      }
    });

    this.eventEmitter.emit(EventTypes.SPRINT_COMPLETED, {
      userId: numUserId,
      projectId: sprint.projectId,
      sprintId: numSprintId,
      incompleteIssueCount: incompleteIssues.length,
      timestamp: new Date(),
    });

    return {
      message: 'Sprint completed successfully',
      incompleteIssuesMoved: incompleteIssues.length,
    };
  }
}
