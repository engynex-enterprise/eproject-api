import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean, IsArray } from 'class-validator';

export class UpdateBoardDto {
  @ApiPropertyOptional({ example: 'Updated Board Name' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  columns?: Array<{ statusId: string; position: number; width?: number }>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  swimlaneBy?: string;
}
