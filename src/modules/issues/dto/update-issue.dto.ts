import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  MaxLength,
  IsInt,
  IsDateString,
  Min,
} from 'class-validator';

export class UpdateIssueDto {
  @ApiPropertyOptional({ example: 'Updated issue title' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  issueTypeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  priorityId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  assigneeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  spaceId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  parentId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  epicId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  sprintId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  versionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(0)
  storyPoints?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
