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
import { VersionsService } from './versions.service.js';
import { CreateVersionDto } from './dto/create-version.dto.js';
import { UpdateVersionDto } from './dto/update-version.dto.js';

@ApiTags('Versions')
@ApiBearerAuth()
@Controller()
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post('projects/:projectId/versions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new version' })
  @ApiResponse({ status: 201, description: 'Version created' })
  async create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionsService.create(projectId, dto);
  }

  @Get('projects/:projectId/versions')
  @ApiOperation({ summary: 'List versions in a project' })
  @ApiResponse({ status: 200, description: 'List of versions' })
  async findAll(@Param('projectId') projectId: string) {
    return this.versionsService.findAllByProject(projectId);
  }

  @Get('versions/:versionId')
  @ApiOperation({ summary: 'Get version by ID' })
  @ApiResponse({ status: 200, description: 'Version details' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async findById(@Param('versionId') versionId: string) {
    return this.versionsService.findById(versionId);
  }

  @Patch('versions/:versionId')
  @ApiOperation({ summary: 'Update a version' })
  @ApiResponse({ status: 200, description: 'Version updated' })
  @ApiResponse({ status: 404, description: 'Version not found' })
  async update(
    @Param('versionId') versionId: string,
    @Body() dto: UpdateVersionDto,
  ) {
    return this.versionsService.update(versionId, dto);
  }

  @Delete('versions/:versionId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a version' })
  @ApiResponse({ status: 200, description: 'Version deleted' })
  async delete(@Param('versionId') versionId: string) {
    return this.versionsService.delete(versionId);
  }

  @Post('versions/:versionId/release')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Release a version' })
  @ApiResponse({ status: 200, description: 'Version released' })
  @ApiResponse({ status: 400, description: 'Version already released' })
  async release(@Param('versionId') versionId: string) {
    return this.versionsService.release(versionId);
  }
}
