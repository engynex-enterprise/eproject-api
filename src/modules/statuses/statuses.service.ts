import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateProjectStatusDto } from './dto/create-project-status.dto.js';

@Injectable()
export class StatusesService {
  constructor(private readonly prisma: PrismaService) {}

  async findSystemStatuses() {
    return this.prisma.status.findMany({
      include: { statusGroup: true },
      orderBy: { id: 'asc' },
    });
  }

  async findProjectStatuses(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.projectStatus.findMany({
      where: { projectId: numProjectId },
      include: {
        status: {
          include: { statusGroup: true },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async addProjectStatus(projectId: string, dto: CreateProjectStatusDto) {
    const numProjectId = Number(projectId);

    // Get the next sortOrder if not provided
    let sortOrder = dto.sortOrder;
    if (sortOrder === undefined) {
      const lastStatus = await this.prisma.projectStatus.findFirst({
        where: { projectId: numProjectId },
        orderBy: { sortOrder: 'desc' },
      });
      sortOrder = (lastStatus?.sortOrder ?? -1) + 1;
    }

    // If a statusId is provided, link the existing status
    if (dto.statusId) {
      return this.prisma.projectStatus.create({
        data: {
          projectId: numProjectId,
          statusId: Number(dto.statusId),
          sortOrder,
          isDefault: dto.isDefault ?? false,
        },
        include: {
          status: {
            include: { statusGroup: true },
          },
        },
      });
    }

    // Otherwise, create a new Status and link it
    // Require a statusGroupId and name to create a new status
    if (!dto.statusGroupId) {
      throw new BadRequestException('Either statusId or statusGroupId must be provided');
    }

    if (!dto.name) {
      throw new BadRequestException('Name is required when creating a new status');
    }

    const status = await this.prisma.status.create({
      data: {
        name: dto.name,
        color: dto.color,
        statusGroupId: Number(dto.statusGroupId),
      },
    });

    return this.prisma.projectStatus.create({
      data: {
        projectId: numProjectId,
        statusId: status.id,
        sortOrder,
        isDefault: dto.isDefault ?? false,
      },
      include: {
        status: {
          include: { statusGroup: true },
        },
      },
    });
  }

  async updateProjectStatus(
    statusId: string,
    data: { sortOrder?: number; isDefault?: boolean },
  ) {
    const numStatusId = Number(statusId);

    const projectStatus = await this.prisma.projectStatus.findUnique({
      where: { id: numStatusId },
    });

    if (!projectStatus) {
      throw new NotFoundException('Status not found');
    }

    return this.prisma.projectStatus.update({
      where: { id: numStatusId },
      data: {
        ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
      },
      include: {
        status: {
          include: { statusGroup: true },
        },
      },
    });
  }

  async deleteProjectStatus(statusId: string) {
    const numStatusId = Number(statusId);

    const projectStatus = await this.prisma.projectStatus.findUnique({
      where: { id: numStatusId },
      include: { status: true },
    });

    if (!projectStatus) {
      throw new NotFoundException('Status not found');
    }

    // Check if any issues use this status
    const issueCount = await this.prisma.issue.count({
      where: { statusId: projectStatus.statusId },
    });

    if (issueCount > 0) {
      throw new BadRequestException(
        `Cannot delete status: ${issueCount} issues still use it. Reassign them first.`,
      );
    }

    await this.prisma.projectStatus.delete({
      where: { id: numStatusId },
    });

    return { message: 'Status deleted successfully' };
  }
}
