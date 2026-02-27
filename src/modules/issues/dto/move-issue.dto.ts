import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, IsNumber } from 'class-validator';

export class MoveIssueDto {
  @ApiPropertyOptional({ description: 'Move to sprint (numeric ID)' })
  @IsOptional()
  @IsInt()
  sprintId?: number;

  @ApiPropertyOptional({ description: 'Move to status (numeric ID)' })
  @IsOptional()
  @IsInt()
  statusId?: number;

  @ApiPropertyOptional({ description: 'Position on the board' })
  @IsOptional()
  @IsNumber()
  boardPosition?: number;

  @ApiPropertyOptional({ description: 'Position in the backlog' })
  @IsOptional()
  @IsNumber()
  backlogPosition?: number;
}
