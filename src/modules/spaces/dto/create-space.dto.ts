import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateSpaceDto {
  @ApiProperty({ example: 'Frontend Team' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'FE' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  key?: string;

  @ApiPropertyOptional({ example: 'Space for frontend-related work' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({ example: 'folder' })
  @IsOptional()
  @IsString()
  icon?: string;
}
