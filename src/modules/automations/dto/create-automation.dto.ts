import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean, IsObject, IsArray } from 'class-validator';

export class CreateAutomationDto {
  @ApiProperty({ example: 'Auto-assign to reviewer' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'Assigns issue to reviewer when moved to In Review' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: 'Trigger condition (e.g., status change, field change)',
    example: { type: 'STATUS_CHANGE', fromStatus: 'In Progress', toStatus: 'In Review' },
  })
  @IsObject()
  trigger: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Actions to perform (array of action objects)',
    example: [{ type: 'ASSIGN', userId: 123 }],
  })
  @IsOptional()
  actions?: any;

  @ApiPropertyOptional({
    description: 'Single action to perform (mapped to actions)',
    example: { type: 'ASSIGN', userId: 123 },
  })
  @IsOptional()
  @IsObject()
  action?: Record<string, any>;

  @ApiPropertyOptional({ default: true, description: 'Whether the automation is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ default: true, description: 'Alias for isActive' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
