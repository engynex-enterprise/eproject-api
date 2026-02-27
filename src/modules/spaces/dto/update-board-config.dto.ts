import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBoolean } from 'class-validator';

export class UpdateBoardConfigDto {
  @ApiPropertyOptional({ description: 'Whether to inherit project board config' })
  @IsOptional()
  @IsBoolean()
  inheritsProject?: boolean;

  @ApiPropertyOptional({ description: 'Board columns configuration' })
  @IsOptional()
  @IsArray()
  columns?: any[];

  @ApiPropertyOptional({ description: 'Swimlanes configuration' })
  @IsOptional()
  @IsArray()
  swimlanes?: any[];

  @ApiPropertyOptional({ description: 'Field used to determine card color', example: 'priority' })
  @IsOptional()
  @IsString()
  cardColorField?: string;

  @ApiPropertyOptional({ description: 'Fields displayed on cards' })
  @IsOptional()
  @IsArray()
  cardDisplayFields?: string[];

  @ApiPropertyOptional({ description: 'Quick filter configurations' })
  @IsOptional()
  @IsArray()
  quickFilters?: any[];
}
