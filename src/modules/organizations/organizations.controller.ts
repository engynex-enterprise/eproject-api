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
import { OrganizationsService } from './organizations.service.js';
import { CreateOrganizationDto } from './dto/create-organization.dto.js';
import { UpdateOrganizationDto } from './dto/update-organization.dto.js';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { CurrentUserPayload } from '../../common/decorators/current-user.decorator.js';

@ApiTags('Organizations')
@ApiBearerAuth()
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new organization' })
  @ApiResponse({ status: 201, description: 'Organization created successfully' })
  async create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateOrganizationDto,
  ) {
    return this.organizationsService.create(user.userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user organizations' })
  @ApiResponse({ status: 200, description: 'List of organizations' })
  async findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.organizationsService.findAll(user.userId);
  }

  @Get(':orgId')
  @ApiOperation({ summary: 'Get organization by ID' })
  @ApiResponse({ status: 200, description: 'Organization details' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async findById(@Param('orgId') orgId: string) {
    return this.organizationsService.findById(orgId);
  }

  @Patch(':orgId')
  @ApiOperation({ summary: 'Update organization' })
  @ApiResponse({ status: 200, description: 'Organization updated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async update(
    @Param('orgId') orgId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(orgId, user.userId, dto);
  }

  @Delete(':orgId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete organization' })
  @ApiResponse({ status: 200, description: 'Organization deleted' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Organization not found' })
  async delete(
    @Param('orgId') orgId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.organizationsService.softDelete(orgId, user.userId);
  }
}
