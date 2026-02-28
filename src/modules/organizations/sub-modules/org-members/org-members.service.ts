import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service.js';
import { AddMemberDto } from './dto/add-member.dto.js';
import { UpdateMemberDto } from './dto/update-member.dto.js';
import { EventEmitterService } from '../../../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../../../shared/events/event-types.js';

@Injectable()
export class OrgMembersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async findAll(orgId: string) {
    const numericOrgId = Number(orgId);

    return this.prisma.organizationMember.findMany({
      where: { orgId: numericOrgId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        role: true,
      },
    });
  }

  async addMember(orgId: string, dto: AddMemberDto, currentUserId: string) {
    const numericOrgId = Number(orgId);
    const numericUserId = Number(dto.userId);
    const numericCurrentUserId = Number(currentUserId);

    // Check if already a member
    const existing = await this.prisma.organizationMember.findFirst({
      where: { userId: numericUserId, orgId: numericOrgId },
    });

    if (existing) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Check user exists
    const user = await this.prisma.user.findUnique({
      where: { id: numericUserId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Look up the role by name
    const roleName = dto.role || 'MEMBER';
    const role = await this.prisma.role.findFirst({
      where: { name: roleName, isSystem: true },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    const member = await this.prisma.organizationMember.create({
      data: {
        userId: numericUserId,
        orgId: numericOrgId,
        roleId: role.id,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        role: true,
      },
    });

    this.eventEmitter.emit(EventTypes.ORG_MEMBER_ADDED, {
      userId: numericCurrentUserId,
      orgId: numericOrgId,
      memberId: numericUserId,
      timestamp: new Date(),
    });

    return member;
  }

  async updateMember(orgId: string, memberId: string, dto: UpdateMemberDto) {
    const numericOrgId = Number(orgId);
    const numericMemberId = Number(memberId);

    const member = await this.prisma.organizationMember.findFirst({
      where: { id: numericMemberId, orgId: numericOrgId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const role = await this.prisma.role.findUnique({
      where: { id: dto.roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${dto.roleId} not found`);
    }

    return this.prisma.organizationMember.update({
      where: { id: numericMemberId },
      data: { roleId: role.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            displayName: true,
            avatarUrl: true,
          },
        },
        role: true,
      },
    });
  }

  async removeMember(orgId: string, memberId: string, currentUserId: string) {
    const numericOrgId = Number(orgId);
    const numericMemberId = Number(memberId);
    const numericCurrentUserId = Number(currentUserId);

    const member = await this.prisma.organizationMember.findFirst({
      where: { id: numericMemberId, orgId: numericOrgId },
      include: { role: true },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role.name === 'OWNER') {
      throw new ForbiddenException('Cannot remove the owner');
    }

    await this.prisma.organizationMember.delete({
      where: { id: numericMemberId },
    });

    this.eventEmitter.emit(EventTypes.ORG_MEMBER_REMOVED, {
      userId: numericCurrentUserId,
      orgId: numericOrgId,
      memberId: member.userId,
      timestamp: new Date(),
    });

    return { message: 'Member removed successfully' };
  }
}
