import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateAppearanceDto {
  @ApiPropertyOptional({ example: '#3B82F6' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#1E40AF' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional({ example: 'Inter' })
  @IsOptional()
  @IsString()
  fontFamily?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo-dark.png' })
  @IsOptional()
  @IsString()
  logoDarkUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/favicon.png' })
  @IsOptional()
  @IsString()
  faviconUrl?: string;

  @ApiPropertyOptional({ example: 'body { background: #fff; }' })
  @IsOptional()
  @IsString()
  customCss?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  darkMode?: boolean;
}
