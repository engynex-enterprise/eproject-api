import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean, IsObject } from 'class-validator';

export class UpdateAutomationDto {
  @ApiPropertyOptional({ example: 'Updated automation name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  trigger?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Actions to perform' })
  @IsOptional()
  actions?: any;

  @ApiPropertyOptional({ description: 'Single action (mapped to actions)' })
  @IsOptional()
  @IsObject()
  action?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Whether the automation is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Alias for isActive' })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
