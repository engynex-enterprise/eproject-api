import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NotificationPreferenceItem {
  @IsString()
  eventType: string;

  @IsString()
  channel: string;

  @IsBoolean()
  isEnabled: boolean;
}

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Event type (e.g., issue_assigned, comment_added)' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ description: 'Notification channel (e.g., internal, email)' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ description: 'Whether this notification is enabled' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiPropertyOptional({ description: 'Bulk update: array of preference items' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationPreferenceItem)
  preferences?: NotificationPreferenceItem[];
}
