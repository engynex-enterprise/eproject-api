import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateVersionDto } from './dto/create-version.dto.js';
import { UpdateVersionDto } from './dto/update-version.dto.js';

@Injectable()
export class VersionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, dto: CreateVersionDto) {
    const numProjectId = Number(projectId);

    return this.prisma.version.create({
      data: {
        projectId: numProjectId,
        name: dto.name,
        description: dto.description,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
        status: 'UNRELEASED',
      },
    });
  }

  async findAllByProject(projectId: string) {
    const numProjectId = Number(projectId);

    return this.prisma.version.findMany({
      where: { projectId: numProjectId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(versionId: string) {
    const numVersionId = Number(versionId);

    const version = await this.prisma.version.findUnique({
      where: { id: numVersionId },
      include: {
        _count: {
          select: { issues: true },
        },
      },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return version;
  }

  async update(versionId: string, dto: UpdateVersionDto) {
    const numVersionId = Number(versionId);

    const version = await this.prisma.version.findUnique({
      where: { id: numVersionId },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    return this.prisma.version.update({
      where: { id: numVersionId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.releaseDate !== undefined && {
          releaseDate: new Date(dto.releaseDate),
        }),
      },
    });
  }

  async delete(versionId: string) {
    const numVersionId = Number(versionId);

    const version = await this.prisma.version.findUnique({
      where: { id: numVersionId },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    // Unlink issues from this version
    await this.prisma.issue.updateMany({
      where: { versionId: numVersionId },
      data: { versionId: null },
    });

    await this.prisma.version.delete({
      where: { id: numVersionId },
    });

    return { message: 'Version deleted successfully' };
  }

  async release(versionId: string) {
    const numVersionId = Number(versionId);

    const version = await this.prisma.version.findUnique({
      where: { id: numVersionId },
    });

    if (!version) {
      throw new NotFoundException('Version not found');
    }

    if (version.status === 'RELEASED') {
      throw new BadRequestException('Version is already released');
    }

    return this.prisma.version.update({
      where: { id: numVersionId },
      data: {
        status: 'RELEASED',
        releaseDate: new Date(),
      },
    });
  }
}
