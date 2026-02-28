import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray, IsInt } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Project Manager' })
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Can manage projects and members' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: [1, 3, 5], description: 'Permission IDs to assign' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  permissionIds?: number[];
}
