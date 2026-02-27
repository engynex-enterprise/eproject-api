import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsInt, Min } from 'class-validator';

export class CreateProjectStatusDto {
  @ApiPropertyOptional({ description: 'ID of an existing status to link to the project' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ example: 'In QA', description: 'Name for a new status (requires statusGroupId)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ example: '#8B5CF6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ description: 'Status group ID (required when creating a new status)' })
  @IsOptional()
  @IsInt()
  statusGroupId?: number;

  @ApiPropertyOptional({ example: 3, description: 'Sort order of the status in the project' })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'Whether this is the default status for new issues' })
  @IsOptional()
  isDefault?: boolean;
}
