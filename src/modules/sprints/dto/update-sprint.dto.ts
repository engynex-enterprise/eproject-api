import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class UpdateSprintDto {
  @ApiPropertyOptional({ example: 'Updated Sprint Name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated goal' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  goal?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
