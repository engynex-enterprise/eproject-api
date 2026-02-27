import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

export class UpdateSpaceDto {
  @ApiPropertyOptional({ example: 'Updated Space Name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '#10B981' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'star' })
  @IsOptional()
  @IsString()
  icon?: string;
}
