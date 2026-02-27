import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AssignTagDto {
  @ApiProperty({ example: 'uuid-of-tag' })
  @IsUUID()
  tagId: string;

  @ApiProperty({ example: 'uuid-of-issue' })
  @IsUUID()
  issueId: string;
}
