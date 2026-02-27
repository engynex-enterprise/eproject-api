import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsObject, IsBoolean } from 'class-validator';

export class CreateFilterDto {
  @ApiProperty({ example: 'My Open Issues' })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'All open issues assigned to me' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    description: 'Filter criteria',
    example: { statusCategory: ['TODO', 'IN_PROGRESS'], assigneeId: 'me' },
  })
  @IsObject()
  criteria: Record<string, any>;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
