import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { UpdateNotificationConfigDto } from './dto/index.js';

// ─── Default email templates ──────────────────────────────────────────────────

const DEFAULT_TEMPLATES = {
  login_report: {
    enabled: true,
    subject: 'Nuevo inicio de sesión en tu cuenta',
    body: `Hola {{name}},\n\nSe ha detectado un nuevo inicio de sesión en tu cuenta.\n\nFecha: {{date}}\nDispositivo: {{device}}\nIP: {{ip}}\n\nSi no fuiste tú, cambia tu contraseña de inmediato.\n\n— El equipo de {{orgName}}`,
  },
  account_activation: {
    enabled: true,
    subject: 'Activa tu cuenta en {{orgName}}',
    body: `Hola {{name}},\n\nBienvenido/a a {{orgName}}. Para activar tu cuenta haz clic en el siguiente enlace:\n\n{{link}}\n\nEste enlace expira en 24 horas.\n\n— El equipo de {{orgName}}`,
  },
  password_recovery: {
    enabled: true,
    subject: 'Recupera tu contraseña en {{orgName}}',
    body: `Hola {{name}},\n\nRecibimos una solicitud para restablecer tu contraseña. Haz clic en el enlace:\n\n{{link}}\n\nEste enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.\n\n— El equipo de {{orgName}}`,
  },
  two_factor: {
    enabled: true,
    subject: 'Código de verificación — {{orgName}}',
    body: `Hola {{name}},\n\nTu código de verificación de dos factores es:\n\n{{code}}\n\nExpira en 10 minutos. No compartas este código con nadie.\n\n— El equipo de {{orgName}}`,
  },
  invitation: {
    enabled: true,
    subject: 'Te han invitado a {{orgName}}',
    body: `Hola,\n\n{{inviterName}} te ha invitado a unirte a {{orgName}} como {{role}}.\n\nAccede con el siguiente enlace:\n\n{{link}}\n\nEste enlace expira en 7 días.\n\n— El equipo de {{orgName}}`,
  },
  report: {
    enabled: true,
    subject: 'Informe semanal — {{orgName}}',
    body: `Hola {{name}},\n\nAquí tienes el resumen de actividad de la semana:\n\n{{reportContent}}\n\n— El equipo de {{orgName}}`,
  },
  custom: {
    enabled: false,
    subject: 'Notificación de {{orgName}}',
    body: `Hola {{name}},\n\n{{message}}\n\n— El equipo de {{orgName}}`,
  },
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class NotificationConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getByOrg(orgId: string) {
    const numericOrgId = Number(orgId);

    let config = await this.prisma.organizationNotificationConfig.findUnique({
      where: { orgId: numericOrgId },
    });

    if (!config) {
      // Return sensible defaults without persisting
      return {
        orgId: numericOrgId,
        emailEnabled: false,
        emailProvider: 'smtp',
        emailFromName: null,
        emailFromAddress: null,
        smtpHost: null,
        smtpPort: 587,
        smtpUser: null,
        smtpPassword: null,
        smtpSecure: false,
        sendgridApiKey: null,
        awsAccessKeyId: null,
        awsSecretAccessKey: null,
        awsRegion: 'us-east-1',
        gmailClientId: null,
        gmailClientSecret: null,
        gmailRefreshToken: null,
        smsEnabled: false,
        smsProvider: null,
        smsApiKey: null,
        whatsappEnabled: false,
        whatsappApiKey: null,
        internalEnabled: true,
        emailTemplates: DEFAULT_TEMPLATES,
      };
    }

    // Merge stored templates with defaults so new template keys are always present
    const storedTemplates =
      config.emailTemplates && typeof config.emailTemplates === 'object'
        ? (config.emailTemplates as Record<string, unknown>)
        : {};

    return {
      ...config,
      emailTemplates: { ...DEFAULT_TEMPLATES, ...storedTemplates },
    };
  }

  async update(orgId: string, dto: UpdateNotificationConfigDto) {
    const numericOrgId = Number(orgId);

    const org = await this.prisma.organization.findUnique({
      where: { id: numericOrgId },
    });
    if (!org) {
      throw new NotFoundException(`Organization ${numericOrgId} not found`);
    }

    const existing = await this.prisma.organizationNotificationConfig.findUnique({
      where: { orgId: numericOrgId },
    });

    const data = this.buildUpdateData(dto);

    if (!existing) {
      const created = await this.prisma.organizationNotificationConfig.create({
        data: { orgId: numericOrgId, ...data },
      });
      return {
        ...created,
        emailTemplates: { ...DEFAULT_TEMPLATES, ...(created.emailTemplates as object ?? {}) },
      };
    }

    const updated = await this.prisma.organizationNotificationConfig.update({
      where: { orgId: numericOrgId },
      data,
    });

    return {
      ...updated,
      emailTemplates: { ...DEFAULT_TEMPLATES, ...(updated.emailTemplates as object ?? {}) },
    };
  }

  private buildUpdateData(dto: UpdateNotificationConfigDto) {
    const data: Record<string, unknown> = {};

    const fields: (keyof UpdateNotificationConfigDto)[] = [
      'emailEnabled', 'emailProvider', 'emailFromName', 'emailFromAddress',
      'smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'smtpSecure',
      'sendgridApiKey',
      'awsAccessKeyId', 'awsSecretAccessKey', 'awsRegion',
      'gmailClientId', 'gmailClientSecret', 'gmailRefreshToken',
      'smsEnabled', 'smsProvider', 'smsApiKey',
      'whatsappEnabled', 'whatsappApiKey',
      'internalEnabled',
    ];

    for (const field of fields) {
      if (dto[field] !== undefined) data[field] = dto[field];
    }

    if (dto.emailTemplates !== undefined) {
      data['emailTemplates'] = dto.emailTemplates;
    }

    return data;
  }
}
