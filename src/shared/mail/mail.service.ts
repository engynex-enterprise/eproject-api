import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
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

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  // ── Config loader ────────────────────────────────────────────────────────────

  private async getConfig(orgId: number) {
    return this.prisma.organizationNotificationConfig.findUnique({
      where: { orgId },
    });
  }

  // ── System-level send (uses .env config) ───────────────────────────────────

  async sendSystemMail(opts: SendMailOptions): Promise<void> {
    const provider = this.configService.get<string>('mail.provider', 'smtp');
    const fromName = this.configService.get<string>('mail.fromName', 'eProject');
    const fromAddress = this.configService.get<string>('mail.fromAddress', '');

    if (!fromAddress) {
      this.logger.warn('MAIL_FROM_ADDRESS not configured — skipping system mail');
      return;
    }

    const from = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

    try {
      switch (provider) {
        case 'sendgrid': {
          const apiKey = this.configService.get<string>('mail.sendgrid.apiKey', '');
          if (!apiKey) {
            this.logger.warn('SENDGRID_API_KEY not configured');
            return;
          }
          await this.sendViaSendGrid(apiKey, from, opts);
          break;
        }

        case 'aws_ses': {
          const accessKeyId = this.configService.get<string>('mail.aws.accessKeyId', '');
          const secretAccessKey = this.configService.get<string>('mail.aws.secretAccessKey', '');
          const region = this.configService.get<string>('mail.aws.region', 'us-east-1');
          if (!accessKeyId || !secretAccessKey) {
            this.logger.warn('AWS SES credentials not configured');
            return;
          }
          await this.sendViaAwsSes({ accessKeyId, secretAccessKey, region }, fromAddress, fromName, opts);
          break;
        }

        case 'gcp': {
          const clientEmail = this.configService.get<string>('mail.gcp.clientEmail', '');
          const privateKey = this.configService.get<string>('mail.gcp.privateKey', '');
          if (!clientEmail || !privateKey) {
            this.logger.warn('GCP credentials not configured');
            return;
          }
          await this.sendViaGcp({ clientEmail, privateKey }, from, opts);
          break;
        }

        case 'smtp':
        default: {
          const host = this.configService.get<string>('mail.smtp.host', '');
          if (!host) {
            this.logger.warn('SMTP_HOST not configured — skipping system mail');
            return;
          }
          await this.sendViaSmtp(
            {
              host,
              port: this.configService.get<number>('mail.smtp.port', 587),
              secure: this.configService.get<boolean>('mail.smtp.secure', false),
              user: this.configService.get<string>('mail.smtp.user') || undefined,
              pass: this.configService.get<string>('mail.smtp.password') || undefined,
            },
            from,
            opts,
          );
          break;
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`System mail failed: ${msg}`);
    }
  }

  // ── Org-level send (DB config with fallback to system) ─────────────────────

  async sendMail(orgId: number, opts: SendMailOptions): Promise<void> {
    const config = await this.getConfig(orgId);

    if (config?.emailEnabled) {
      return this.sendWithOrgConfig(config, opts);
    }

    // Fallback to system-level config
    return this.sendSystemMail(opts);
  }

  private async sendWithOrgConfig(
    config: NonNullable<Awaited<ReturnType<typeof this.getConfig>>>,
    opts: SendMailOptions,
  ): Promise<void> {
    const fromAddress = config.emailFromAddress;
    if (!fromAddress) {
      this.logger.warn(`No from address configured for org ${config.orgId} — skipping send`);
      return;
    }

    const from = config.emailFromName
      ? `${config.emailFromName} <${fromAddress}>`
      : fromAddress;

    switch (config.emailProvider) {
      case 'sendgrid':
        if (!config.sendgridApiKey) {
          this.logger.warn(`SendGrid API key missing for org ${config.orgId}`);
          return;
        }
        await this.sendViaSendGrid(config.sendgridApiKey, from, opts);
        break;

      case 'aws_ses':
        if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
          this.logger.warn(`AWS SES credentials missing for org ${config.orgId}`);
          return;
        }
        await this.sendViaAwsSes(
          {
            accessKeyId: config.awsAccessKeyId,
            secretAccessKey: config.awsSecretAccessKey,
            region: config.awsRegion ?? 'us-east-1',
          },
          fromAddress,
          config.emailFromName ?? undefined,
          opts,
        );
        break;

      case 'gcp':
        if (!config.gmailClientId || !config.gmailRefreshToken) {
          this.logger.warn(`GCP credentials missing for org ${config.orgId}`);
          return;
        }
        await this.sendViaGcp(
          { clientEmail: config.gmailClientId, privateKey: config.gmailRefreshToken },
          from,
          opts,
        );
        break;

      case 'smtp':
      default:
        if (!config.smtpHost) {
          this.logger.warn(`SMTP host missing for org ${config.orgId}`);
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
            html: '<p>La conexión con <strong>SendGrid</strong> funciona correctamente.</p>',
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

        case 'aws_ses': {
          if (!config.awsAccessKeyId || !config.awsSecretAccessKey) {
            return { success: false, message: 'Faltan las credenciales de AWS SES' };
          }
          return { success: true, message: 'Credenciales de AWS SES configuradas' };
        }

        case 'gcp': {
          if (!config.gmailClientId || !config.gmailRefreshToken) {
            return { success: false, message: 'Faltan las credenciales de GCP' };
          }
          return { success: true, message: 'Credenciales de GCP configuradas' };
        }

        default:
          return { success: false, message: `Proveedor "${config.emailProvider}" no soportado` };
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

  private async sendViaAwsSes(
    awsCfg: { accessKeyId: string; secretAccessKey: string; region: string },
    fromAddress: string,
    fromName: string | undefined,
    opts: SendMailOptions,
  ): Promise<void> {
    const client = new SESClient({
      region: awsCfg.region,
      credentials: {
        accessKeyId: awsCfg.accessKeyId,
        secretAccessKey: awsCfg.secretAccessKey,
      },
    });

    const source = fromName ? `${fromName} <${fromAddress}>` : fromAddress;

    const command = new SendEmailCommand({
      Source: source,
      Destination: { ToAddresses: [opts.to] },
      Message: {
        Subject: { Data: opts.subject, Charset: 'UTF-8' },
        Body: {
          Html: { Data: opts.html, Charset: 'UTF-8' },
          ...(opts.text ? { Text: { Data: opts.text, Charset: 'UTF-8' } } : {}),
        },
      },
    });

    await client.send(command);
    this.logger.debug(`AWS SES: sent "${opts.subject}" to ${opts.to}`);
  }

  private async sendViaGcp(
    gcpCfg: { clientEmail: string; privateKey: string },
    from: string,
    opts: SendMailOptions,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.gmail.com',
      port: 465,
      secure: true,
      auth: {
        type: 'OAuth2',
        user: gcpCfg.clientEmail,
        serviceClient: gcpCfg.clientEmail,
        privateKey: gcpCfg.privateKey,
      },
    } as nodemailer.TransportOptions);

    await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
    });
    this.logger.debug(`GCP: sent "${opts.subject}" to ${opts.to}`);
  }

  // ── Template renderer ─────────────────────────────────────────────────────────

  renderTemplate(template: string, vars: Record<string, string>): string {
    return Object.entries(vars).reduce(
      (tpl, [key, val]) => tpl.replaceAll(`{{${key}}}`, val),
      template,
    );
  }
}
