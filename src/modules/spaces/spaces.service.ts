import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateSpaceDto } from './dto/create-space.dto.js';
import { UpdateSpaceDto } from './dto/update-space.dto.js';
import { UpdateSpaceSettingsDto } from './dto/update-space-settings.dto.js';
import { UpdateBoardConfigDto } from './dto/update-board-config.dto.js';

@Injectable()
export class SpacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateSpaceDto) {
    const numProjectId = Number(projectId);

    return this.prisma.space.create({
      data: {
        projectId: numProjectId,
        name: dto.name,
        key: dto.key ?? dto.name.toUpperCase().replace(/\s+/g, '_').slice(0, 10),
        description: dto.description,
        color: dto.color,
        iconName: dto.icon,
      },
    });
  }

  async findAllByProject(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.space.findMany({
      where: { projectId: numProjectId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findById(spaceId: string) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space;
  }

  async update(spaceId: string, dto: UpdateSpaceDto) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return this.prisma.space.update({
      where: { id: numSpaceId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.icon !== undefined && { iconName: dto.icon }),
      },
    });
  }

  async getSettings(spaceId: string) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: {
        settings: true,
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space.settings || {};
  }

  async updateSettings(spaceId: string, dto: UpdateSpaceSettingsDto) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: { settings: true },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.settings) {
      return this.prisma.spaceSettings.update({
        where: { spaceId: numSpaceId },
        data: {
          ...(dto.inheritsProject !== undefined && { inheritsProject: dto.inheritsProject }),
          ...(dto.defaultStatusId !== undefined && { defaultStatusId: dto.defaultStatusId }),
          ...(dto.defaultPriorityId !== undefined && { defaultPriorityId: dto.defaultPriorityId }),
          ...(dto.defaultIssueTypeId !== undefined && { defaultIssueTypeId: dto.defaultIssueTypeId }),
        },
      });
    }

    return this.prisma.spaceSettings.create({
      data: {
        spaceId: numSpaceId,
        ...(dto.inheritsProject !== undefined && { inheritsProject: dto.inheritsProject }),
        ...(dto.defaultStatusId !== undefined && { defaultStatusId: dto.defaultStatusId }),
        ...(dto.defaultPriorityId !== undefined && { defaultPriorityId: dto.defaultPriorityId }),
        ...(dto.defaultIssueTypeId !== undefined && { defaultIssueTypeId: dto.defaultIssueTypeId }),
      },
    });
  }

  async getBoardConfig(spaceId: string) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: {
        boardConfig: true,
      },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    return space.boardConfig || {};
  }

  async updateBoardConfig(spaceId: string, dto: UpdateBoardConfigDto) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: { boardConfig: true },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.boardConfig) {
      return this.prisma.spaceBoardConfig.update({
        where: { spaceId: numSpaceId },
        data: {
          ...(dto.columns !== undefined && { columns: dto.columns }),
          ...(dto.swimlanes !== undefined && { swimlanes: dto.swimlanes }),
          ...(dto.cardColorField !== undefined && { cardColorField: dto.cardColorField }),
          ...(dto.cardDisplayFields !== undefined && { cardDisplayFields: dto.cardDisplayFields }),
          ...(dto.quickFilters !== undefined && { quickFilters: dto.quickFilters }),
        },
      });
    }

    return this.prisma.spaceBoardConfig.create({
      data: {
        spaceId: numSpaceId,
        ...(dto.columns !== undefined && { columns: dto.columns }),
        ...(dto.swimlanes !== undefined && { swimlanes: dto.swimlanes }),
        ...(dto.cardColorField !== undefined && { cardColorField: dto.cardColorField }),
        ...(dto.cardDisplayFields !== undefined && { cardDisplayFields: dto.cardDisplayFields }),
        ...(dto.quickFilters !== undefined && { quickFilters: dto.quickFilters }),
      },
    });
  }

  async delete(spaceId: string) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    await this.prisma.space.delete({
      where: { id: numSpaceId },
    });

    return { message: 'Space deleted successfully' };
  }
}
