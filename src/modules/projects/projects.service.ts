import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProjectDto } from './dto/create-project.dto.js';
import { UpdateProjectDto } from './dto/update-project.dto.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(orgId: string, userId: string, dto: CreateProjectDto) {
    const numOrgId = Number(orgId);
    const numUserId = Number(userId);

    // Validate unique key per org
    const existingProject = await this.prisma.project.findFirst({
      where: { orgId: numOrgId, key: dto.key, deletedAt: null },
    });

    if (existingProject) {
      throw new ConflictException(`Project with key "${dto.key}" already exists in this organization`);
    }

    const project = await this.prisma.$transaction(async (tx) => {
      // Create the project
      const newProject = await tx.project.create({
        data: {
          name: dto.name,
          key: dto.key,
          description: dto.description,
          orgId: numOrgId,
          issueCounter: 0,
        },
      });

      // Look up (or create) a default ADMIN role for this org
      let adminRole = await tx.role.findFirst({
        where: { orgId: numOrgId, name: 'Admin', scope: 'organization' },
      });
      if (!adminRole) {
        adminRole = await tx.role.create({
          data: {
            orgId: numOrgId,
            name: 'Admin',
            scope: 'organization',
            isSystem: true,
          },
        });
      }

      // Add creator as project member with ADMIN role
      await tx.projectMember.create({
        data: {
          userId: numUserId,
          projectId: newProject.id,
          roleId: adminRole.id,
        },
      });

      // Seed default statuses for this project
      // Pre-fetch or create all needed status groups to reduce queries
      const statusGroupNames = ['Backlog', 'To Do', 'In Progress', 'Done', 'Cancelled'];
      const statusGroupMap = new Map<string, { id: number }>();
      for (const sgName of statusGroupNames) {
        let sg = await tx.statusGroup.findUnique({ where: { name: sgName } });
        if (!sg) {
          sg = await tx.statusGroup.create({ data: { name: sgName, color: '#6B7280' } });
        }
        statusGroupMap.set(sgName, sg);
      }

      const defaultStatuses = [
        { name: 'Backlog', color: '#6B7280', statusGroupName: 'Backlog', sortOrder: 0 },
        { name: 'To Do', color: '#3B82F6', statusGroupName: 'To Do', sortOrder: 1 },
        { name: 'In Progress', color: '#F59E0B', statusGroupName: 'In Progress', sortOrder: 2 },
        { name: 'In Review', color: '#8B5CF6', statusGroupName: 'In Progress', sortOrder: 3 },
        { name: 'Done', color: '#10B981', statusGroupName: 'Done', sortOrder: 4 },
        { name: 'Cancelled', color: '#EF4444', statusGroupName: 'Cancelled', sortOrder: 5 },
      ];

      for (const statusDef of defaultStatuses) {
        const statusGroup = statusGroupMap.get(statusDef.statusGroupName)!;

        const status = await tx.status.create({
          data: {
            name: statusDef.name,
            color: statusDef.color,
            statusGroupId: statusGroup.id,
          },
        });

        await tx.projectStatus.create({
          data: {
            projectId: newProject.id,
            statusId: status.id,
            sortOrder: statusDef.sortOrder,
            isDefault: statusDef.sortOrder === 0,
          },
        });
      }

      // Seed default issue types
      const defaultIssueTypes = [
        { name: 'Epic', iconName: 'epic', color: '#8B5CF6', isDefault: false },
        { name: 'Story', iconName: 'story', color: '#10B981', isDefault: true },
        { name: 'Task', iconName: 'task', color: '#3B82F6', isDefault: false },
        { name: 'Bug', iconName: 'bug', color: '#EF4444', isDefault: false },
        { name: 'Sub-task', iconName: 'subtask', color: '#6B7280', isDefault: false },
      ];

      for (const issueTypeDef of defaultIssueTypes) {
        const issueType = await tx.issueType.create({
          data: {
            name: issueTypeDef.name,
            iconName: issueTypeDef.iconName,
            color: issueTypeDef.color,
          },
        });

        await tx.projectIssueType.create({
          data: {
            projectId: newProject.id,
            issueTypeId: issueType.id,
            isDefault: issueTypeDef.isDefault,
          },
        });
      }

      // Seed default priorities
      const defaultPriorities = [
        { name: 'Urgent', iconName: 'urgent', color: '#EF4444', value: 0 },
        { name: 'High', iconName: 'high', color: '#F59E0B', value: 1 },
        { name: 'Medium', iconName: 'medium', color: '#3B82F6', value: 2 },
        { name: 'Low', iconName: 'low', color: '#10B981', value: 3 },
        { name: 'None', iconName: 'none', color: '#6B7280', value: 4 },
      ];

      for (const priorityDef of defaultPriorities) {
        const priority = await tx.priority.create({
          data: {
            name: priorityDef.name,
            iconName: priorityDef.iconName,
            color: priorityDef.color,
            value: priorityDef.value,
          },
        });

        await tx.projectPriority.create({
          data: {
            projectId: newProject.id,
            priorityId: priority.id,
            isDefault: priorityDef.value === 2, // Medium as default
          },
        });
      }

      // Create a default board
      await tx.board.create({
        data: {
          projectId: newProject.id,
          name: 'Default Board',
          isDefault: true,
        },
      });

      // Create a default workflow
      await tx.workflow.create({
        data: {
          projectId: newProject.id,
          name: 'Default Workflow',
          isDefault: true,
        },
      });

      return newProject;
    }, { timeout: 30000 });

    this.eventEmitter.emit(EventTypes.PROJECT_CREATED, {
      userId: numUserId,
      orgId: numOrgId,
      projectId: project.id,
      timestamp: new Date(),
    });

    return project;
  }

  async findAllByOrg(orgId: string) {
    const numOrgId = Number(orgId);

    const projects = await this.prisma.project.findMany({
      where: { orgId: numOrgId, deletedAt: null },
      include: {
        _count: {
          select: {
            members: true,
            issues: { where: { deletedAt: null } },
            sprints: true,
            spaces: { where: { deletedAt: null, isActive: true } },
          },
        },
        // Spaces
        spaces: {
          where: { deletedAt: null, isActive: true },
          select: { id: true, name: true, key: true, color: true, iconName: true },
          orderBy: { sortOrder: 'asc' },
        },
        // Lead user info
        members: {
          where: { isActive: true },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true },
            },
          },
          take: 5,
          orderBy: { joinedAt: 'asc' },
        },
        // Active sprint
        sprints: {
          where: { status: 'active' },
          take: 1,
          select: { id: true, name: true, startDate: true, endDate: true, status: true },
        },
        // Issues grouped by status group for progress
        issues: {
          where: { deletedAt: null },
          select: {
            status: {
              select: {
                statusGroup: { select: { name: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => {
      // Count issues by status group
      const issuesByGroup: Record<string, number> = {};
      for (const issue of project.issues) {
        const groupName = issue.status?.statusGroup?.name ?? 'Unknown';
        issuesByGroup[groupName] = (issuesByGroup[groupName] ?? 0) + 1;
      }

      const totalIssues = project.issues.length;
      const doneCount = issuesByGroup['Done'] ?? 0;
      const inProgressCount = issuesByGroup['In Progress'] ?? 0;

      // Derive project health color
      let healthColor = '#4C9AFF'; // blue - default / no issues
      if (totalIssues > 0) {
        const doneRatio = doneCount / totalIssues;
        if (doneRatio >= 0.7) {
          healthColor = '#36B37E'; // green
        } else if (doneRatio >= 0.3) {
          healthColor = '#FF991F'; // orange
        } else {
          healthColor = '#FF5630'; // red-orange
        }
      }

      const activeSprint = project.sprints[0] ?? null;

      return {
        id: project.id,
        name: project.name,
        key: project.key,
        description: project.description,
        orgId: project.orgId,
        avatarUrl: project.avatarUrl,
        isActive: project.isActive,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString(),
        memberCount: project._count.members,
        issueCount: project._count.issues,
        sprintCount: project._count.sprints,
        members: project.members.map((m) => ({
          id: m.user.id,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          avatarUrl: m.user.avatarUrl,
        })),
        activeSprint: activeSprint
          ? {
              id: activeSprint.id,
              name: activeSprint.name,
              startDate: activeSprint.startDate?.toISOString() ?? null,
              endDate: activeSprint.endDate?.toISOString() ?? null,
            }
          : null,
        issueStats: {
          total: totalIssues,
          done: doneCount,
          inProgress: inProgressCount,
          todo: totalIssues - doneCount - inProgressCount,
        },
        healthColor,
        leadId: project.leadId,
        spaceCount: project._count.spaces,
        spaces: project.spaces.map((s) => ({
          id: s.id,
          name: s.name,
          key: s.key,
          color: s.color,
          iconName: s.iconName,
        })),
      };
    });
  }

  async findById(projectId: string) {
    const numProjectId = Number(projectId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
      include: {
        _count: {
          select: {
            members: true,
            issues: true,
            sprints: true,
            spaces: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findByKeyOnly(key: string) {
    const project = await this.prisma.project.findFirst({
      where: { key, deletedAt: null },
      include: {
        _count: {
          select: {
            members: true,
            issues: true,
            sprints: true,
            spaces: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async findByKey(orgId: string, key: string) {
    const numOrgId = Number(orgId);

    const project = await this.prisma.project.findFirst({
      where: { orgId: numOrgId, key, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    const numProjectId = Number(projectId);
    const numUserId = Number(userId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updated = await this.prisma.project.update({
      where: { id: numProjectId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
    });

    this.eventEmitter.emit(EventTypes.PROJECT_UPDATED, {
      userId: numUserId,
      orgId: project.orgId,
      projectId: project.id,
      timestamp: new Date(),
    });

    return updated;
  }

  async softDelete(projectId: string, userId: string) {
    const numProjectId = Number(projectId);
    const numUserId = Number(userId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.prisma.project.update({
      where: { id: numProjectId },
      data: { deletedAt: new Date() },
    });

    this.eventEmitter.emit(EventTypes.PROJECT_DELETED, {
      userId: numUserId,
      orgId: project.orgId,
      projectId: project.id,
      timestamp: new Date(),
    });

    return { message: 'Project deleted successfully' };
  }
}
