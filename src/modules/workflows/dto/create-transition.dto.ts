import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID, MaxLength } from 'class-validator';

export class CreateTransitionDto {
  @ApiProperty({ description: 'Source status ID' })
  @IsUUID()
  fromStatusId: string;

  @ApiProperty({ description: 'Target status ID' })
  @IsUUID()
  toStatusId: string;

  @ApiPropertyOptional({ example: 'Start Progress' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;
}
