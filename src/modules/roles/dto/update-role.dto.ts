import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray, IsInt } from 'class-validator';

export class UpdateRoleDto {
  @ApiPropertyOptional({ example: 'Updated Role Name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: [1, 3, 5], description: 'Permission IDs to assign (replaces existing)' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}
