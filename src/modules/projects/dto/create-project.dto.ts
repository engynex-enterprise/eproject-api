import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'My Project' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 'PROJ', description: 'Unique project key (2-10 uppercase chars)' })
  @IsString()
  @Matches(/^[A-Z][A-Z0-9]{1,9}$/, {
    message: 'Key must be 2-10 uppercase alphanumeric characters starting with a letter',
  })
  key: string;

  @ApiPropertyOptional({ example: 'A project for tracking issues' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
}
