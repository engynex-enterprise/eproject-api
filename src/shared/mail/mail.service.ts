import { Injectable, Logger } from '@nestjs/common';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { PrismaService } from '../../database/prisma.service.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface MailTestResult {
  success: boolean;
  message: string;
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Config loader ────────────────────────────────────────────────────────────

  private async getConfig(orgId: number) {
    return this.prisma.organizationNotificationConfig.findUnique({
      where: { orgId },
    });
  }

  // ── Send ─────────────────────────────────────────────────────────────────────

  async sendMail(orgId: number, opts: SendMailOptions): Promise<void> {
    const config = await this.getConfig(orgId);

    if (!config?.emailEnabled) {
      this.logger.warn(`Email disabled for org ${orgId} — skipping send`);
      return;
    }

    const fromAddress = config.emailFromAddress;
    if (!fromAddress) {
      this.logger.warn(`No from address configured for org ${orgId} — skipping send`);
      return;
    }

    const from = config.emailFromName
      ? `${config.emailFromName} <${fromAddress}>`
      : fromAddress;

    switch (config.emailProvider) {
      case 'sendgrid':
        if (!config.sendgridApiKey) {
          this.logger.warn(`SendGrid API key missing for org ${orgId}`);
          return;
        }
        await this.sendViaSendGrid(config.sendgridApiKey, from, opts);
        break;

      case 'smtp':
        if (!config.smtpHost) {
          this.logger.warn(`SMTP host missing for org ${orgId}`);
          return;
        }
        await this.sendViaSmtp(
          {
            host: config.smtpHost,
            port: config.smtpPort ?? 587,
            secure: config.smtpSecure ?? false,
            user: config.smtpUser ?? undefined,
            pass: config.smtpPassword ?? undefined,
          },
          from,
          opts,
        );
        break;

      default:
        this.logger.warn(`Unsupported email provider "${config.emailProvider}" for org ${orgId}`);
    }
  }

  // ── Test connection ───────────────────────────────────────────────────────────

  async testConnection(orgId: number): Promise<MailTestResult> {
    const config = await this.getConfig(orgId);

    if (!config?.emailEnabled) {
      return { success: false, message: 'El correo electrónico no está habilitado' };
    }

    const fromAddress = config.emailFromAddress;
    if (!fromAddress) {
      return { success: false, message: 'No hay dirección de remitente configurada (De:)' };
    }

    try {
      switch (config.emailProvider) {
        case 'sendgrid': {
          if (!config.sendgridApiKey) {
            return { success: false, message: 'Falta la API Key de SendGrid' };
          }
          const from = config.emailFromName
            ? `${config.emailFromName} <${fromAddress}>`
            : fromAddress;
          await this.sendViaSendGrid(config.sendgridApiKey, from, {
            to: fromAddress,
            subject: 'Prueba de conexión — eProject',
            html: '<p>La conexión con <strong>SendGrid</strong> funciona correctamente. Este es un correo de prueba generado automáticamente.</p>',
          });
          return { success: true, message: `Correo de prueba enviado a ${fromAddress} vía SendGrid` };
        }

        case 'smtp': {
          if (!config.smtpHost) {
            return { success: false, message: 'Falta el host SMTP' };
          }
          const transporter = nodemailer.createTransport({
            host: config.smtpHost,
            port: config.smtpPort ?? 587,
            secure: config.smtpSecure ?? false,
            auth: config.smtpUser
              ? { user: config.smtpUser, pass: config.smtpPassword ?? '' }
              : undefined,
          });
          await transporter.verify();
          return { success: true, message: `Conexión SMTP con ${config.smtpHost}:${config.smtpPort ?? 587} verificada` };
        }

        default:
          return { success: false, message: `Proveedor "${config.emailProvider}" no tiene soporte de prueba aún` };
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Email test failed for org ${orgId}: ${msg}`);
      return { success: false, message: msg };
    }
  }

  // ── Provider implementations ─────────────────────────────────────────────────

  private async sendViaSendGrid(
    apiKey: string,
    from: string,
    opts: SendMailOptions,
  ): Promise<void> {
    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to: opts.to,
      from,
      subject: opts.subject,
      html: opts.html,
      text: opts.text ?? opts.html.replace(/<[^>]*>/g, ''),
    });
    this.logger.debug(`SendGrid: sent "${opts.subject}" to ${opts.to}`);
  }

  private async sendViaSmtp(
    smtpCfg: { host: string; port: number; secure: boolean; user?: string; pass?: string },
    from: string,
    opts: SendMailOptions,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: smtpCfg.host,
      port: smtpCfg.port,
      secure: smtpCfg.secure,
      auth: smtpCfg.user ? { user: smtpCfg.user, pass: smtpCfg.pass ?? '' } : undefined,
    });
    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    this.logger.debug(`SMTP: sent "${opts.subject}" to ${opts.to}`);
  }

  // ── Template renderer ─────────────────────────────────────────────────────────

  renderTemplate(template: string, vars: Record<string, string>): string {
    return Object.entries(vars).reduce(
      (tpl, [key, val]) => tpl.replaceAll(`{{${key}}}`, val),
      template,
    );
  }
}
