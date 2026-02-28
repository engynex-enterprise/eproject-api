import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsPositive } from 'class-validator';

export class UpdateMemberDto {
  @ApiProperty({ example: 2, description: 'Role ID to assign to the member' })
  @IsInt()
  @IsPositive()
  roleId!: number;
}
