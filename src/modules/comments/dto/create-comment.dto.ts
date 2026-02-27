import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({ example: '<p>This is a comment</p>' })
  @IsString()
  @MinLength(1)
  content: string;
}
