import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { EventEmitterService } from '../../../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../../../shared/events/event-types.js';
import { randomBytes } from 'crypto';

@Injectable()
export class OrgInvitationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
  ) {}

  async create(orgId: string, dto: CreateInvitationDto, invitedByUserId: string) {
    const numericOrgId = Number(orgId);
    const numericInvitedById = Number(invitedByUserId);

    // Check if already a member
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        orgId: numericOrgId,
        user: { email: dto.email.toLowerCase() },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    // Check if invitation already exists
    const existingInvitation = await this.prisma.organizationInvitation.findFirst({
      where: {
        orgId: numericOrgId,
        email: dto.email.toLowerCase(),
        status: 'PENDING',
      },
    });

    if (existingInvitation) {
      throw new ConflictException('An invitation is already pending for this email');
    }

    // Look up the role by name
    const roleName = dto.role || 'MEMBER';
    const role = await this.prisma.role.findFirst({
      where: { name: roleName, isSystem: true },
    });

    if (!role) {
      throw new NotFoundException(`Role '${roleName}' not found`);
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 3600000); // 7 days

    const invitation = await this.prisma.organizationInvitation.create({
      data: {
        orgId: numericOrgId,
        email: dto.email.toLowerCase(),
        roleId: role.id,
        token,
        expiresAt,
        invitedById: numericInvitedById,
        status: 'PENDING',
      },
    });

    this.eventEmitter.emit(EventTypes.ORG_INVITATION_SENT, {
      userId: numericInvitedById,
      orgId: numericOrgId,
      email: dto.email,
      timestamp: new Date(),
    });

    return invitation;
  }

  async findAll(orgId: string) {
    const numericOrgId = Number(orgId);

    return this.prisma.organizationInvitation.findMany({
      where: { orgId: numericOrgId },
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async accept(token: string, userId: string) {
    const numericUserId = Number(userId);

    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: {
        token,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
    });

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation');
    }

    // Verify the accepting user's email matches the invitation
    const user = await this.prisma.user.findUnique({
      where: { id: numericUserId },
    });

    if (!user || user.email.toLowerCase() !== invitation.email.toLowerCase()) {
      throw new BadRequestException('This invitation was sent to a different email');
    }

    await this.prisma.$transaction(async (tx) => {
      // Update invitation status
      await tx.organizationInvitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      // Add as member
      await tx.organizationMember.create({
        data: {
          userId: numericUserId,
          orgId: invitation.orgId,
          roleId: invitation.roleId,
        },
      });
    });

    this.eventEmitter.emit(EventTypes.ORG_INVITATION_ACCEPTED, {
      userId: numericUserId,
      orgId: invitation.orgId,
      timestamp: new Date(),
    });

    return { message: 'Invitation accepted successfully' };
  }
}
