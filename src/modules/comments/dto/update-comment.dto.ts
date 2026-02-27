import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: '<p>Updated comment</p>' })
  @IsString()
  @MinLength(1)
  content: string;
}
