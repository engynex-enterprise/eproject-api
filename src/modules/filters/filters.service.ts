import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateFilterDto } from './dto/create-filter.dto.js';
import { UpdateFilterDto } from './dto/update-filter.dto.js';

@Injectable()
export class FiltersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateFilterDto) {
    const numericUserId = Number(userId);

    return this.prisma.savedFilter.create({
      data: {
        userId: numericUserId,
        name: dto.name,
        description: dto.description,
        filterQuery: dto.criteria ?? {},
        isShared: dto.isShared || false,
      },
    });
  }

  async findAll(userId: string) {
    const numericUserId = Number(userId);

    return this.prisma.savedFilter.findMany({
      where: {
        OR: [
          { userId: numericUserId },
          { isShared: true },
        ],
      },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(filterId: string) {
    const numericFilterId = Number(filterId);

    const filter = await this.prisma.savedFilter.findUnique({
      where: { id: numericFilterId },
    });

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    return filter;
  }

  async update(filterId: string, userId: string, dto: UpdateFilterDto) {
    const numericFilterId = Number(filterId);
    const numericUserId = Number(userId);

    const filter = await this.prisma.savedFilter.findUnique({
      where: { id: numericFilterId },
    });

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    if (filter.userId !== numericUserId) {
      throw new ForbiddenException('You can only edit your own filters');
    }

    return this.prisma.savedFilter.update({
      where: { id: numericFilterId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.criteria !== undefined && { filterQuery: dto.criteria }),
        ...(dto.isShared !== undefined && { isShared: dto.isShared }),
      },
    });
  }

  async delete(filterId: string, userId: string) {
    const numericFilterId = Number(filterId);
    const numericUserId = Number(userId);

    const filter = await this.prisma.savedFilter.findUnique({
      where: { id: numericFilterId },
    });

    if (!filter) {
      throw new NotFoundException('Filter not found');
    }

    if (filter.userId !== numericUserId) {
      throw new ForbiddenException('You can only delete your own filters');
    }

    await this.prisma.savedFilter.delete({
      where: { id: numericFilterId },
    });

    return { message: 'Filter deleted successfully' };
  }
}
