import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum OrgRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  VIEWER = 'VIEWER',
}

export class AddMemberDto {
  @ApiProperty({ example: 'user-uuid' })
  @IsString()
  userId: string;

  @ApiPropertyOptional({ enum: OrgRole, default: OrgRole.MEMBER })
  @IsOptional()
  @IsEnum(OrgRole)
  role?: OrgRole = OrgRole.MEMBER;
}
