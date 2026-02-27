import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  Min,
  Max,
  IsIn,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// ─── Email Template ───────────────────────────────────────────────────────────

export class EmailTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  body?: string;
}

// ─── Email Templates Map ──────────────────────────────────────────────────────

export class EmailTemplatesDto {
  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  login_report?: EmailTemplateDto;

  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  account_activation?: EmailTemplateDto;

  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  password_recovery?: EmailTemplateDto;

  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  two_factor?: EmailTemplateDto;

  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  invitation?: EmailTemplateDto;

  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  report?: EmailTemplateDto;

  @ApiPropertyOptional({ type: EmailTemplateDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailTemplateDto)
  custom?: EmailTemplateDto;
}

// ─── Main DTO ─────────────────────────────────────────────────────────────────

export class UpdateNotificationConfigDto {
  // ── Email general ──────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailEnabled?: boolean;

  @ApiPropertyOptional({ enum: ['smtp', 'sendgrid', 'aws_ses', 'gmail'] })
  @IsOptional()
  @IsIn(['smtp', 'sendgrid', 'aws_ses', 'gmail'])
  emailProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailFromName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailFromAddress?: string;

  // ── SMTP ───────────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpHost?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpUser?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smtpPassword?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smtpSecure?: boolean;

  // ── SendGrid ───────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sendgridApiKey?: string;

  // ── AWS SES ────────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awsAccessKeyId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awsSecretAccessKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  awsRegion?: string;

  // ── Gmail OAuth2 ───────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gmailClientId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gmailClientSecret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  gmailRefreshToken?: string;

  // ── SMS ────────────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  smsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smsProvider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  smsApiKey?: string;

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  whatsappEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  whatsappApiKey?: string;

  // ── Internal ───────────────────────────────────────────────────────────────
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  internalEnabled?: boolean;

  // ── Email templates ────────────────────────────────────────────────────────
  @ApiPropertyOptional({ type: EmailTemplatesDto })
  @IsOptional()
  @IsObject()
  emailTemplates?: Record<string, { enabled?: boolean; subject?: string; body?: string }>;
}
