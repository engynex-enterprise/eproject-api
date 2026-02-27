import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({ example: 'My Company' })
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @ApiPropertyOptional({ example: 'A great company that builds software' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
