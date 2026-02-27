import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class TransitionIssueDto {
  @ApiProperty({ description: 'Target status ID (numeric)' })
  @IsInt()
  statusId: number;
}
