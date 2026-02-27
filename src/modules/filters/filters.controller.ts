import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { FiltersService } from './filters.service.js';
import { CreateFilterDto } from './dto/create-filter.dto.js';
import { UpdateFilterDto } from './dto/update-filter.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Filters')
@ApiBearerAuth()
@Controller('filters')
export class FiltersController {
  constructor(private readonly filtersService: FiltersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a saved filter' })
  @ApiResponse({ status: 201, description: 'Filter created' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateFilterDto,
  ) {
    return this.filtersService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List saved filters (own + shared)' })
  @ApiResponse({ status: 200, description: 'List of filters' })
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.filtersService.findAll(user.userId);
  }

  @Get(':filterId')
  @ApiOperation({ summary: 'Get filter by ID' })
  @ApiResponse({ status: 200, description: 'Filter details' })
  @ApiResponse({ status: 404, description: 'Filter not found' })
  async findById(@Param('filterId') filterId: string) {
    return this.filtersService.findById(filterId);
  }

  @Patch(':filterId')
  @ApiOperation({ summary: 'Update a filter' })
  @ApiResponse({ status: 200, description: 'Filter updated' })
  @ApiResponse({ status: 403, description: 'Can only edit own filters' })
  @ApiResponse({ status: 404, description: 'Filter not found' })
  async update(
    @Param('filterId') filterId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateFilterDto,
  ) {
    return this.filtersService.update(filterId, user.userId, dto);
  }

  @Delete(':filterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a filter' })
  @ApiResponse({ status: 200, description: 'Filter deleted' })
  @ApiResponse({ status: 403, description: 'Can only delete own filters' })
  @ApiResponse({ status: 404, description: 'Filter not found' })
  async delete(
    @Param('filterId') filterId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.filtersService.delete(filterId, user.userId);
  }
}
