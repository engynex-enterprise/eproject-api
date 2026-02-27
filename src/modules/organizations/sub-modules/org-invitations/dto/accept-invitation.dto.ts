import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AcceptInvitationDto {
  @ApiProperty({ example: 'invitation-token-uuid' })
  @IsString()
  token: string;
}
