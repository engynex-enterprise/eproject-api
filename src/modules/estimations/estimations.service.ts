import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateEstimationConfigDto } from './dto/update-estimation-config.dto.js';

const DEFAULT_ESTIMATION = {
  estimationType: 'story_points',
  storyPointScale: [0, 1, 2, 3, 5, 8, 13, 21],
  customScale: null as any,
};

@Injectable()
export class EstimationsService {
  constructor(private readonly prisma: PrismaService) {}

  private formatEstimation(record: {
    estimationType: string;
    storyPointScale: any;
    customScale: any;
  }) {
    return {
      type: record.estimationType,
      values: record.storyPointScale ?? record.customScale ?? [],
      estimationType: record.estimationType,
      storyPointScale: record.storyPointScale,
      customScale: record.customScale,
    };
  }

  async getProjectEstimation(projectId: string) {
    const numProjectId = Number(projectId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
      include: { estimation: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (!project.estimation) {
      return {
        type: DEFAULT_ESTIMATION.estimationType,
        values: DEFAULT_ESTIMATION.storyPointScale,
        estimationType: DEFAULT_ESTIMATION.estimationType,
        storyPointScale: DEFAULT_ESTIMATION.storyPointScale,
        customScale: DEFAULT_ESTIMATION.customScale,
      };
    }

    return this.formatEstimation(project.estimation);
  }

  async updateProjectEstimation(projectId: string, dto: UpdateEstimationConfigDto) {
    const numProjectId = Number(projectId);

    const project = await this.prisma.project.findUnique({
      where: { id: numProjectId, deletedAt: null },
      include: { estimation: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const updateData: Record<string, any> = {};
    if (dto.type !== undefined) updateData.estimationType = dto.type;
    if (dto.values !== undefined) updateData.storyPointScale = dto.values;

    if (project.estimation) {
      const updated = await this.prisma.projectEstimation.update({
        where: { projectId: numProjectId },
        data: updateData,
      });
      return this.formatEstimation(updated);
    }

    const created = await this.prisma.projectEstimation.create({
      data: {
        projectId: numProjectId,
        ...DEFAULT_ESTIMATION,
        ...updateData,
      },
    });
    return this.formatEstimation(created);
  }

  async getSpaceEstimation(spaceId: string) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: { estimation: true },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    if (space.estimation && !space.estimation.inheritsProject) {
      return this.formatEstimation(space.estimation);
    }

    // Fall back to project estimation config
    return this.getProjectEstimation(String(space.projectId));
  }

  async updateSpaceEstimation(spaceId: string, dto: UpdateEstimationConfigDto) {
    const numSpaceId = Number(spaceId);

    const space = await this.prisma.space.findUnique({
      where: { id: numSpaceId },
      include: { estimation: true },
    });

    if (!space) {
      throw new NotFoundException('Space not found');
    }

    const updateData: Record<string, any> = {
      inheritsProject: false,
    };
    if (dto.type !== undefined) updateData.estimationType = dto.type;
    if (dto.values !== undefined) updateData.storyPointScale = dto.values;

    if (space.estimation) {
      const updated = await this.prisma.spaceEstimation.update({
        where: { spaceId: numSpaceId },
        data: updateData,
      });
      return this.formatEstimation(updated);
    }

    const created = await this.prisma.spaceEstimation.create({
      data: {
        spaceId: numSpaceId,
        ...DEFAULT_ESTIMATION,
        ...updateData,
      },
    });
    return this.formatEstimation(created);
  }
}
