import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitterService } from './event-emitter.service.js';
import { EventTypes } from './event-types.js';
import { NotificationsService } from '../../modules/notifications/notifications.service.js';
import { MailService } from '../mail/mail.service.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class NotificationListener implements OnModuleInit {
  private readonly logger = new Logger(NotificationListener.name);

  constructor(
    private readonly eventEmitter: EventEmitterService,
    private readonly notifications: NotificationsService,
    private readonly mail: MailService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit() {
    // Auth events
    this.eventEmitter.on(EventTypes.USER_REGISTERED, (p) => this.onUserRegistered(p as any));
    this.eventEmitter.on(EventTypes.USER_LOGGED_IN, (p) => this.onUserLoggedIn(p as any));
    this.eventEmitter.on(EventTypes.USER_PASSWORD_RESET, (p) => this.onPasswordReset(p as any));
    this.eventEmitter.on(EventTypes.USER_EMAIL_VERIFIED, (p) => this.onEmailVerified(p as any));

    // Org events
    this.eventEmitter.on(EventTypes.ORG_MEMBER_ADDED, (p) => this.onOrgMemberAdded(p as any));
    this.eventEmitter.on(EventTypes.ORG_INVITATION_SENT, (p) => this.onInvitationSent(p as any));

    // Issue events
    this.eventEmitter.on(EventTypes.ISSUE_ASSIGNED, (p) => this.onIssueAssigned(p as any));
    this.eventEmitter.on(EventTypes.COMMENT_CREATED, (p) => this.onCommentCreated(p as any));

    // Sprint events
    this.eventEmitter.on(EventTypes.SPRINT_STARTED, (p) => this.onSprintStarted(p as any));
    this.eventEmitter.on(EventTypes.SPRINT_COMPLETED, (p) => this.onSprintCompleted(p as any));

    this.logger.log('Notification listeners registered');
  }

  // ── Auth handlers ─────────────────────────────────────────────────────────

  private async onUserRegistered(payload: { userId: number; email: string }) {
    try {
      await this.notifications.createNotification({
        userId: payload.userId,
        type: 'welcome',
        title: 'Bienvenido/a a eProject',
        body: 'Tu cuenta ha sido creada exitosamente. Explora tus proyectos y comienza a trabajar.',
      });
    } catch (err) {
      this.logger.error(`onUserRegistered failed: ${(err as Error).message}`);
    }
  }

  private async onUserLoggedIn(payload: { userId: number }) {
    try {
      const shouldEmail = await this.isChannelEnabled(payload.userId, 'user.logged_in', 'email');
      if (!shouldEmail) return;

      const user = await this.prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user) return;

      await this.mail.sendSystemMail({
        to: user.email,
        subject: 'Nuevo inicio de sesión — eProject',
        html: `<p>Hola ${user.firstName},</p>
<p>Se ha detectado un nuevo inicio de sesión en tu cuenta el ${new Date().toLocaleString('es-ES', { timeZone: user.timezone })}.</p>
<p>Si no fuiste tú, cambia tu contraseña de inmediato.</p>
<p>— El equipo de eProject</p>`,
      });
    } catch (err) {
      this.logger.error(`onUserLoggedIn failed: ${(err as Error).message}`);
    }
  }

  private async onPasswordReset(payload: { userId: number }) {
    try {
      await this.notifications.createNotification({
        userId: payload.userId,
        type: 'password_reset',
        title: 'Solicitud de restablecimiento de contraseña',
        body: 'Se ha solicitado un enlace para restablecer tu contraseña.',
      });
    } catch (err) {
      this.logger.error(`onPasswordReset failed: ${(err as Error).message}`);
    }
  }

  private async onEmailVerified(payload: { userId: number }) {
    try {
      await this.notifications.createNotification({
        userId: payload.userId,
        type: 'email_verified',
        title: 'Correo verificado',
        body: 'Tu dirección de correo electrónico ha sido verificada exitosamente.',
      });
    } catch (err) {
      this.logger.error(`onEmailVerified failed: ${(err as Error).message}`);
    }
  }

  // ── Org handlers ──────────────────────────────────────────────────────────

  private async onOrgMemberAdded(payload: { userId: number; orgId: number }) {
    try {
      const org = await this.prisma.organization.findUnique({ where: { id: payload.orgId } });
      await this.notifications.createNotification({
        userId: payload.userId,
        type: 'org_member_added',
        title: `Te han agregado a ${org?.name ?? 'una organización'}`,
        body: `Ahora eres miembro de ${org?.name ?? 'la organización'}.`,
        resourceType: 'organization',
        resourceId: payload.orgId,
      });
    } catch (err) {
      this.logger.error(`onOrgMemberAdded failed: ${(err as Error).message}`);
    }
  }

  private async onInvitationSent(payload: { userId: number; orgId: number; email?: string; inviterName?: string; role?: string }) {
    try {
      if (!payload.email) return;

      const org = await this.prisma.organization.findUnique({ where: { id: payload.orgId } });
      const orgName = org?.name ?? 'eProject';

      await this.mail.sendSystemMail({
        to: payload.email,
        subject: `Te han invitado a ${orgName}`,
        html: `<p>Hola,</p>
<p>${payload.inviterName ?? 'Alguien'} te ha invitado a unirte a <strong>${orgName}</strong>${payload.role ? ` como ${payload.role}` : ''}.</p>
<p>Inicia sesión en eProject para aceptar la invitación.</p>
<p>— El equipo de eProject</p>`,
      });
    } catch (err) {
      this.logger.error(`onInvitationSent failed: ${(err as Error).message}`);
    }
  }

  // ── Issue handlers ────────────────────────────────────────────────────────

  private async onIssueAssigned(payload: { userId: number; issueId: number | string; projectId?: number | string }) {
    try {
      const issue = await this.prisma.issue.findUnique({
        where: { id: Number(payload.issueId) },
        select: { title: true, issueNumber: true, assigneeId: true },
      });
      if (!issue || !issue.assigneeId) return;

      const issueRef = `#${issue.issueNumber}`;
      await this.notifications.createNotification({
        userId: issue.assigneeId,
        type: 'issue_assigned',
        title: `Se te asignó: ${issueRef} ${issue.title}`,
        body: `Se te ha asignado el issue "${issue.title}".`,
        resourceType: 'issue',
        resourceId: Number(payload.issueId),
      });

      // Send email if enabled
      const shouldEmail = await this.isChannelEnabled(issue.assigneeId, 'issue.assigned', 'email');
      if (shouldEmail) {
        const user = await this.prisma.user.findUnique({ where: { id: issue.assigneeId } });
        if (user) {
          await this.mail.sendSystemMail({
            to: user.email,
            subject: `Se te asignó: ${issueRef} ${issue.title}`,
            html: `<p>Hola ${user.firstName},</p>
<p>Se te ha asignado el issue <strong>${issueRef} ${issue.title}</strong>.</p>
<p>— El equipo de eProject</p>`,
          });
        }
      }
    } catch (err) {
      this.logger.error(`onIssueAssigned failed: ${(err as Error).message}`);
    }
  }

  private async onCommentCreated(payload: { userId: number; issueId?: number | string }) {
    try {
      if (!payload.issueId) return;

      const issue = await this.prisma.issue.findUnique({
        where: { id: Number(payload.issueId) },
        select: { title: true, issueNumber: true, reporterId: true, assigneeId: true },
      });
      if (!issue) return;

      const issueRef = `#${issue.issueNumber}`;

      // Notify reporter and assignee (exclude commenter)
      const notifyIds = new Set<number>();
      if (issue.reporterId && issue.reporterId !== payload.userId) notifyIds.add(issue.reporterId);
      if (issue.assigneeId && issue.assigneeId !== payload.userId) notifyIds.add(issue.assigneeId);

      for (const uid of notifyIds) {
        await this.notifications.createNotification({
          userId: uid,
          type: 'issue_commented',
          title: `Nuevo comentario en ${issueRef} ${issue.title}`,
          body: `Se ha agregado un nuevo comentario al issue "${issue.title}".`,
          resourceType: 'issue',
          resourceId: Number(payload.issueId),
        });
      }
    } catch (err) {
      this.logger.error(`onCommentCreated failed: ${(err as Error).message}`);
    }
  }

  // ── Sprint handlers ───────────────────────────────────────────────────────

  private async onSprintStarted(payload: { userId: number; sprintId?: number | string; projectId?: number | string }) {
    try {
      await this.notifyProjectMembers(payload, 'sprint_started', 'Sprint iniciado');
    } catch (err) {
      this.logger.error(`onSprintStarted failed: ${(err as Error).message}`);
    }
  }

  private async onSprintCompleted(payload: { userId: number; sprintId?: number | string; projectId?: number | string }) {
    try {
      await this.notifyProjectMembers(payload, 'sprint_completed', 'Sprint completado');
    } catch (err) {
      this.logger.error(`onSprintCompleted failed: ${(err as Error).message}`);
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private async notifyProjectMembers(
    payload: { userId: number; sprintId?: number | string; projectId?: number | string },
    type: string,
    title: string,
  ) {
    if (!payload.projectId) return;

    const sprint = payload.sprintId
      ? await this.prisma.sprint.findUnique({
          where: { id: Number(payload.sprintId) },
          select: { name: true },
        })
      : null;

    const members = await this.prisma.projectMember.findMany({
      where: { projectId: Number(payload.projectId) },
      select: { userId: true },
    });

    const sprintName = sprint?.name ?? '';
    for (const member of members) {
      if (member.userId === payload.userId) continue;
      await this.notifications.createNotification({
        userId: member.userId,
        type,
        title: `${title}: ${sprintName}`,
        body: `El sprint "${sprintName}" ha sido ${type === 'sprint_started' ? 'iniciado' : 'completado'}.`,
        resourceType: 'sprint',
        resourceId: payload.sprintId ? Number(payload.sprintId) : undefined,
      });
    }
  }

  private async isChannelEnabled(userId: number, eventType: string, channel: string): Promise<boolean> {
    const pref = await this.prisma.notificationPreference.findFirst({
      where: { userId, eventType, channel },
    });
    // Default to false — user must opt in for email notifications
    return pref?.isEnabled ?? false;
  }
}
