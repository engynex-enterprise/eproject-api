import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateIssueDto {
  @ApiProperty({ example: 'Implement login page' })
  @IsString()
  @MaxLength(500)
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  issueTypeId: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  priorityId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  spaceId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  assigneeId?: number;

  @ApiPropertyOptional({ example: '<p>Detailed description here</p>' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  epicId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  sprintId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  versionId?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsInt()
  @Min(0)
  storyPoints?: number;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
