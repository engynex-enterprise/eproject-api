import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateSprintDto {
  @ApiProperty({ example: 'Sprint 1' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'First sprint of the project' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  goal?: string;

  @ApiPropertyOptional({ example: '2026-03-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-03-15T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
