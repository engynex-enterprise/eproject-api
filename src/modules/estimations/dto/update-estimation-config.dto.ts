import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsBoolean, IsEnum } from 'class-validator';

export enum EstimationType {
  STORY_POINTS = 'STORY_POINTS',
  TIME = 'TIME',
  T_SHIRT = 'T_SHIRT',
  CUSTOM = 'CUSTOM',
}

export class UpdateEstimationConfigDto {
  @ApiPropertyOptional({ enum: EstimationType })
  @IsOptional()
  @IsEnum(EstimationType)
  type?: EstimationType;

  @ApiPropertyOptional({
    description: 'Available estimation values',
    example: [0, 1, 2, 3, 5, 8, 13, 21],
  })
  @IsOptional()
  @IsArray()
  values?: (number | string)[];

  @ApiPropertyOptional({ description: 'Default estimation value', example: 0 })
  @IsOptional()
  defaultValue?: number | string;

  @ApiPropertyOptional({ description: 'Whether estimation is required' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;
}
