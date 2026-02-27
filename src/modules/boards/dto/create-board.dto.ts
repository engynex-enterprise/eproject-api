import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsBoolean, IsArray } from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({ example: 'Sprint Board' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  columns?: Array<{ statusId: string; position: number; width?: number }>;

  @ApiPropertyOptional({ example: 'none' })
  @IsOptional()
  @IsString()
  swimlaneBy?: string;
}
