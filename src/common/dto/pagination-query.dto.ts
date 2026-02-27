import { IsOptional, IsInt, Min, Max, IsString, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    minimum: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 20,
    minimum: 1,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
    example: 'DESC',
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder: SortOrder = SortOrder.DESC;

  /**
   * Returns the number of records to skip for Prisma queries.
   */
  get skip(): number {
    return (this.page - 1) * this.limit;
  }

  /**
   * Returns the take value for Prisma queries.
   */
  get take(): number {
    return this.limit;
  }

  /**
   * Returns the Prisma orderBy object.
   */
  get orderBy(): Record<string, 'asc' | 'desc'> | undefined {
    if (!this.sortBy) {
      return undefined;
    }
    return { [this.sortBy]: this.sortOrder === SortOrder.ASC ? 'asc' : 'desc' };
  }
}
