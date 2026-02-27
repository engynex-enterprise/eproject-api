import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-uuid' })
  @IsString()
  token: string;

  @ApiProperty({ example: 'NewSecureP@ss1', minLength: 8 })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
