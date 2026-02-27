import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsDateString } from 'class-validator';

export class CreateVersionDto {
  @ApiProperty({ example: 'v1.0.0' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Initial release' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '2026-04-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;
}
