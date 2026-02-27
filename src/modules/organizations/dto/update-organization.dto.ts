import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength, IsUrl } from 'class-validator';

export class UpdateOrganizationDto {
  @ApiPropertyOptional({ example: 'My Updated Company' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiPropertyOptional({ example: 'https://mycompany.com' })
  @IsOptional()
  @IsUrl()
  website?: string;
}
