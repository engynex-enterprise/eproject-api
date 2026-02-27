import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateTagDto {
  @ApiPropertyOptional({ example: 'updated-tag' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;
}
