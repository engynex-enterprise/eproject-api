import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../database/prisma.service.js';
import { CreateInvitationDto } from './dto/create-invitation.dto.js';
import { EventEmitterService } from '../../../../shared/events/event-emitter.service.js';
import { EventTypes } from '../../../../shared/events/event-types.js';
import { MailService } from '../../../../shared/mail/mail.service.js';
import { randomBytes } from 'crypto';

@Injectable()
export class OrgInvitationsService {
  private readonly logger = new Logger(OrgInvitationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitterService,
    private readonly mailService: MailService,
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

    // Look up the role by id
    const role = dto.roleId
      ? await this.prisma.role.findUnique({ where: { id: dto.roleId } })
      : await this.prisma.role.findFirst({ where: { scope: 'organization', isSystem: true, orgId: null }, orderBy: { id: 'asc' } });

    if (!role) {
      throw new NotFoundException('Role not found');
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

    // Send invitation email (fire-and-forget — never block the response)
    this.sendInvitationEmail(numericOrgId, dto.email, token, role.name, numericInvitedById).catch(
      (err: Error) => this.logger.error(`Failed to send invitation email: ${err?.message}`),
    );

    return invitation;
  }

  private async sendInvitationEmail(
    orgId: number,
    toEmail: string,
    token: string,
    roleName: string,
    invitedById: number,
  ): Promise<void> {
    // Load org + inviter info
    const [org, inviter, notifConfig] = await Promise.all([
      this.prisma.organization.findUnique({ where: { id: orgId }, select: { name: true } }),
      this.prisma.user.findUnique({
        where: { id: invitedById },
        select: { firstName: true, lastName: true, displayName: true },
      }),
      this.prisma.organizationNotificationConfig.findUnique({ where: { orgId } }),
    ]);

    if (!org || !notifConfig?.emailEnabled) return;

    const orgName = org.name;
    const inviterName =
      inviter?.displayName ??
      [inviter?.firstName, inviter?.lastName].filter(Boolean).join(' ') ??
      'Un administrador';

    const appUrl = process.env['NEXT_PUBLIC_APP_URL'] ?? process.env['APP_URL'] ?? 'http://localhost:3000';
    const link = `${appUrl}/accept-invitation?token=${token}`;

    // Fetch template from stored config or fall back to a plain template
    const templates = notifConfig.emailTemplates as Record<string, { enabled: boolean; subject: string; body: string }> | null;
    const tpl = templates?.['invitation'];

    const subject = tpl?.subject
      ? this.mailService.renderTemplate(tpl.subject, { orgName, inviterName, role: roleName })
      : `Te han invitado a ${orgName}`;

    const bodyText = tpl?.body
      ? this.mailService.renderTemplate(tpl.body, { orgName, inviterName, role: roleName, link })
      : `Hola,\n\n${inviterName} te ha invitado a unirte a ${orgName} como ${roleName}.\n\nAccede con el siguiente enlace:\n\n${link}\n\nEste enlace expira en 7 días.\n\n— El equipo de ${orgName}`;

    const html = bodyText
      .split('\n')
      .map((line) => (line.trim() === '' ? '<br>' : `<p style="margin:0 0 8px">${line}</p>`))
      .join('');

    await this.mailService.sendMail(orgId, { to: toEmail, subject, html, text: bodyText });
  }

  async getPreview(token: string): Promise<{
    orgId: number;
    orgName: string;
    roleName: string;
    inviterName: string;
    email: string;
    expiresAt: Date;
  }> {
    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: { token, status: 'PENDING', expiresAt: { gt: new Date() } },
      include: { role: { select: { name: true } } },
    });

    if (!invitation) {
      throw new BadRequestException('Invitación inválida o expirada');
    }

    const [org, inviter] = await Promise.all([
      this.prisma.organization.findUnique({
        where: { id: invitation.orgId },
        select: { name: true },
      }),
      this.prisma.user.findUnique({
        where: { id: invitation.invitedById },
        select: { firstName: true, lastName: true, displayName: true },
      }),
    ]);

    const inviterName =
      inviter?.displayName ??
      [inviter?.firstName, inviter?.lastName].filter(Boolean).join(' ') ??
      'Un administrador';

    return {
      orgId: invitation.orgId,
      orgName: org?.name ?? 'Organización',
      roleName: invitation.role.name,
      inviterName,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    };
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

  async cancel(orgId: string, invitationId: string) {
    const numericOrgId = Number(orgId);
    const numericInvitationId = Number(invitationId);

    const invitation = await this.prisma.organizationInvitation.findFirst({
      where: { id: numericInvitationId, orgId: numericOrgId, status: 'PENDING' },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    await this.prisma.organizationInvitation.update({
      where: { id: numericInvitationId },
      data: { status: 'CANCELLED' },
    });

    return { message: 'Invitation cancelled successfully' };
  }
}
