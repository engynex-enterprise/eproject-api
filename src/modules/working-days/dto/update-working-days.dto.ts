import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdateWorkingDaysDto {
  @ApiPropertyOptional({
    description: 'Working days of the week (0=Sun, 1=Mon, ..., 6=Sat)',
    example: [1, 2, 3, 4, 5],
  })
  @IsOptional()
  @IsArray()
  workingDays?: number[];

  @ApiPropertyOptional({
    description: 'Holiday dates (ISO strings)',
    example: ['2026-12-25', '2026-01-01'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  holidays?: string[];

  @ApiPropertyOptional({ description: 'Start time of working hours', example: '09:00' })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiPropertyOptional({ description: 'End time of working hours', example: '17:00' })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiPropertyOptional({ description: 'Include weekends', default: false })
  @IsOptional()
  @IsBoolean()
  includeWeekends?: boolean;
}
