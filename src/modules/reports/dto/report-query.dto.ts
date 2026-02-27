import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsString } from 'class-validator';

export class ReportQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-31T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Sprint ID (numeric)' })
  @IsOptional()
  @IsString()
  sprintId?: string;
}
