import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateTagDto } from './dto/create-tag.dto.js';
import { UpdateTagDto } from './dto/update-tag.dto.js';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(orgId: string, dto: CreateTagDto) {
    const numericOrgId = Number(orgId);

    return this.prisma.tag.create({
      data: {
        orgId: numericOrgId,
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async findAllByOrg(orgId: string) {
    const numericOrgId = Number(orgId);

    return this.prisma.tag.findMany({
      where: { orgId: numericOrgId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(tagId: string) {
    const numericTagId = Number(tagId);

    const tag = await this.prisma.tag.findUnique({
      where: { id: numericTagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return tag;
  }

  async update(tagId: string, dto: UpdateTagDto) {
    const numericTagId = Number(tagId);

    const tag = await this.prisma.tag.findUnique({
      where: { id: numericTagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    return this.prisma.tag.update({
      where: { id: numericTagId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async delete(tagId: string) {
    const numericTagId = Number(tagId);

    const tag = await this.prisma.tag.findUnique({
      where: { id: numericTagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    await this.prisma.tag.delete({
      where: { id: numericTagId },
    });

    return { message: 'Tag deleted successfully' };
  }

  async assignToIssue(tagId: string, issueId: string) {
    const numericTagId = Number(tagId);
    const numericIssueId = Number(issueId);

    const existing = await this.prisma.issueTag.findFirst({
      where: { tagId: numericTagId, issueId: numericIssueId },
    });

    if (existing) {
      throw new ConflictException('Tag is already assigned to this issue');
    }

    return this.prisma.issueTag.create({
      data: { tagId: numericTagId, issueId: numericIssueId },
      include: { tag: true },
    });
  }

  async removeFromIssue(tagId: string, issueId: string) {
    const numericTagId = Number(tagId);
    const numericIssueId = Number(issueId);

    const existing = await this.prisma.issueTag.findFirst({
      where: { tagId: numericTagId, issueId: numericIssueId },
    });

    if (!existing) {
      throw new NotFoundException('Tag assignment not found');
    }

    await this.prisma.issueTag.delete({
      where: { id: existing.id },
    });

    return { message: 'Tag removed from issue' };
  }
}
