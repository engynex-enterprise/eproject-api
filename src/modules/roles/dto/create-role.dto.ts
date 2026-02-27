import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsArray } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Project Manager' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Can manage projects and members' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ example: ['project:create', 'project:update', 'issue:create'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permissions?: string[];
}
