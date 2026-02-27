import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { OrgRole } from './add-member.dto.js';

export class UpdateMemberDto {
  @ApiProperty({ enum: OrgRole })
  @IsEnum(OrgRole)
  role: OrgRole;
}
