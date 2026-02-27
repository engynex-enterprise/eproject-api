import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { generateSlug } from '../../common/utils/slug.util.js';
import { EventEmitterService } from '../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../shared/events/event-types.js';
import { randomBytes } from 'crypto';

@Injectable()
export class OrganizationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(userId: string, dto: CreateOrganizationDto) {
    const slug = `${generateSlug(dto.name)}-${randomBytes(3).toString('hex')}`;
    const numericUserId = Number(userId);

    const org = await this.prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: {
          name: dto.name,
          slug,
          description: dto.description,
          isPersonal: false,
        },
      });

      // Find the OWNER role
      const ownerRole = await tx.role.findFirst({
        where: { name: 'OWNER', isSystem: true },
      });

      if (!ownerRole) {
        throw new NotFoundException('Owner role not found');
      }

      // Add creator as OWNER member
      await tx.organizationMember.create({
        data: {
          userId: numericUserId,
          orgId: organization.id,
          roleId: ownerRole.id,
        },
      });

      return organization;
    });

    this.eventEmitter.emit(EventTypes.ORG_CREATED, {
      userId: numericUserId,
      orgId: org.id,
      timestamp: new Date(),
    });

    return org;
  }

  async findAll(userId: string) {
    const numericUserId = Number(userId);

    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId: numericUserId },
      include: {
        organization: true,
        role: true,
      },
    });

    return memberships.map((m: typeof memberships[number]) => ({
      ...m.organization,
      role: m.role.name,
    }));
  }

  async findById(orgId: string) {
    const numericOrgId = Number(orgId);

    const org = await this.prisma.organization.findUnique({
      where: { id: numericOrgId, deletedAt: null },
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    return org;
  }

  async update(orgId: string, userId: string, dto: UpdateOrganizationDto) {
    const numericOrgId = Number(orgId);
    const numericUserId = Number(userId);

    const org = await this.prisma.organization.findUnique({
      where: { id: numericOrgId, deletedAt: null },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    // Check if user is owner or admin
    const membership = await this.prisma.organizationMember.findFirst({
      where: {
        userId: numericUserId,
        orgId: numericOrgId,
        role: { name: { in: ['OWNER', 'ADMIN'] } },
      },
    });

    if (!membership) {
      throw new ForbiddenException('Only owners and admins can update organization');
    }

    const updated = await this.prisma.organization.update({
      where: { id: numericOrgId },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.website !== undefined && { website: dto.website }),
      },
    });

    this.eventEmitter.emit(EventTypes.ORG_UPDATED, {
      userId: numericUserId,
      orgId: numericOrgId,
      timestamp: new Date(),
    });

    return updated;
  }

  async softDelete(orgId: string, userId: string) {
    const numericOrgId = Number(orgId);
    const numericUserId = Number(userId);

    const org = await this.prisma.organization.findUnique({
      where: { id: numericOrgId, deletedAt: null },
    });

    if (!org) {
      throw new NotFoundException('Organization not found');
    }

    if (org.isPersonal) {
      throw new ForbiddenException('Cannot delete personal organization');
    }

    // Check if user is the owner
    const ownerMembership = await this.prisma.organizationMember.findFirst({
      where: {
        orgId: numericOrgId,
        userId: numericUserId,
        role: { name: 'OWNER' },
      },
    });

    if (!ownerMembership) {
      throw new ForbiddenException('Only the owner can delete an organization');
    }

    await this.prisma.organization.update({
      where: { id: numericOrgId },
      data: { deletedAt: new Date() },
    });

    this.eventEmitter.emit(EventTypes.ORG_DELETED, {
      userId: numericUserId,
      orgId: numericOrgId,
      timestamp: new Date(),
    });

    return { message: 'Organization deleted successfully' };
  }
}
