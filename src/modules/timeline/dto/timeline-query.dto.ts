import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString, IsUUID } from 'class-validator';

export class TimelineQueryDto {
  @ApiPropertyOptional({ example: '2026-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-30T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  spaceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  epicId?: string;
}
