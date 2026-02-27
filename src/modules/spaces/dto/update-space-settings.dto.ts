import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsInt } from 'class-validator';

export class UpdateSpaceSettingsDto {
  @ApiPropertyOptional({ description: 'Whether to inherit project settings' })
  @IsOptional()
  @IsBoolean()
  inheritsProject?: boolean;

  @ApiPropertyOptional({ description: 'Default status ID for new issues in this space' })
  @IsOptional()
  @IsInt()
  defaultStatusId?: number;

  @ApiPropertyOptional({ description: 'Default priority ID for new issues in this space' })
  @IsOptional()
  @IsInt()
  defaultPriorityId?: number;

  @ApiPropertyOptional({ description: 'Default issue type ID for new issues in this space' })
  @IsOptional()
  @IsInt()
  defaultIssueTypeId?: number;
}
