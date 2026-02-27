import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsEnum } from 'class-validator';
import { OrgRole } from '../../org-members/dto/add-member.dto.js';

export class CreateInvitationDto {
  @ApiProperty({ example: 'newuser@example.com' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: OrgRole, default: OrgRole.MEMBER })
  @IsOptional()
  @IsEnum(OrgRole)
  role?: OrgRole = OrgRole.MEMBER;
}
